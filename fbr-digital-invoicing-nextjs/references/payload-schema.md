# Invoice Payload Schema (from official Technical Spec v1.12)

This is the authoritative field-level schema for `postinvoicedata` / `validateinvoicedata`. Use this — not assumptions — when building the invoice form, validation layer, and TypeScript types in `/lib/fbr/types.ts`.

## Endpoints

| Purpose | Sandbox URL | Production URL |
|---|---|---|
| Post invoice | `https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb` | `https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata` |
| Validate invoice | `https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb` | `https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata` |

Both take the same payload shape. `validateinvoicedata` is a pre-flight check (no FBR record created); `postinvoicedata` actually creates the record and returns an FBR invoice number.

## Invoice header fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `invoiceType` | string | Required | `"Sale Invoice"` or `"Debit Note"` |
| `invoiceDate` | date | Required | Format `YYYY-MM-DD` |
| `sellerNTNCNIC` | string | Required | 7-digit NTN or 13-digit CNIC |
| `sellerBusinessName` | string | Required | |
| `sellerProvince` | string | Required | Must match a value from the Province reference API |
| `sellerAddress` | string | Required | |
| `buyerNTNCNIC` | string | Required (optional only if buyer is Unregistered) | |
| `buyerBusinessName` | string | Required | |
| `buyerProvince` | string | Required | From Province reference API |
| `buyerAddress` | string | Required | |
| `buyerRegistrationType` | string | Required | `"Registered"` or `"Unregistered"` |
| `invoiceRefNo` | string | Required **only** for Debit Note | The original invoice's FBR invoice number (22 digits for NTN-based, 28 for CNIC-based) |
| `scenarioId` | string | Required for **sandbox only** — omit in production | e.g. `"SN001"` (see `scenarios.md`) |
| `items` | array | Required | See item fields below |

## Invoice item fields (per line item)

| Field | Type | Required | Notes |
|---|---|---|---|
| `hsCode` | string | Required | Must exist in the HS Code reference API and be valid for the chosen `saleType` |
| `productDescription` | string | Required | |
| `rate` | string | Required | e.g. `"18%"` — from the Sale-Type-To-Rate reference API |
| `uoM` | string | Required | From the UOM reference API, and must match what's valid for the given HS code (see HS_UOM reference API) |
| `quantity` | number (decimal) | Required | |
| `totalValues` | number (decimal) | Required | Total sales value including tax |
| `valueSalesExcludingST` | number (decimal) | Required | Sales value excluding sales tax |
| `fixedNotifiedValueOrRetailPrice` | number (decimal) | Required | Item-based notified/fixed/retail price if applicable, else 0 |
| `salesTaxApplicable` | number (decimal) | Required | Sales Tax/FED amount (excluding further & extra tax) |
| `salesTaxWithheldAtSource` | number (decimal) | Required | |
| `extraTax` | number (decimal) | Optional | |
| `furtherTax` | number (decimal) | Optional | |
| `sroScheduleNo` | string | Optional | |
| `fedPayable` | number (decimal) | Optional | Federal excise duty payable |
| `discount` | number (decimal) | Optional | |
| `saleType` | string | Required | e.g. `"Goods at standard rate (default)"` — drives which HS codes/rates are valid |
| `sroItemSerialNo` | string | Optional | |

**Important production-vs-sandbox difference:** the `scenarioId` field is present in sandbox payloads but must be **omitted entirely in production** — don't send an empty string, drop the key.

## Response shape (post/validate)

Success:
```json
{
  "invoiceNumber": "7000007DI1747119701593",
  "dated": "2025-05-13 12:01:41",
  "validationResponse": {
    "statusCode": "00",
    "status": "Valid",
    "error": "",
    "invoiceStatuses": [
      { "itemSNo": "1", "statusCode": "00", "status": "Valid", "invoiceNo": "7000007DI1747119701593-1", "errorCode": "", "error": "" }
    ]
  }
}
```

Failure (header-level — e.g. malformed request):
```json
{
  "dated": "2025-05-13 13:09:05",
  "validationResponse": {
    "statusCode": "01",
    "status": "Invalid",
    "errorCode": "0052",
    "error": "Provide proper HS Code with invoice no. null",
    "invoiceStatuses": null
  }
}
```

Failure (item-level — header passes but a line item fails):
```json
{
  "validationResponse": {
    "statusCode": "00",
    "status": "invalid",
    "invoiceStatuses": [
      { "itemSNo": "1", "statusCode": "01", "status": "Invalid", "invoiceNo": null, "errorCode": "0046", "error": "Provide rate." }
    ]
  }
}
```

**Parsing rule for the app:** always check both the header-level `statusCode`/`status` AND each entry in `invoiceStatuses[]` — an invoice can have a valid header but an invalid line item, or vice versa. Store `invoiceNumber` (the real FBR invoice number, only present on success) as `fbrIrn` and `dated` as `fbrTimestamp` on the Invoice record — `fbrTimestamp` is the authoritative post time for computing the 180-day Debit/Credit Note correction window (see `features-spec.md` Section 3), not local post time.

HTTP status codes: `200` OK, `401` Unauthorized, `500` Internal Server Error.

See `error-codes.md` for the full list of `errorCode` values and their meanings.
