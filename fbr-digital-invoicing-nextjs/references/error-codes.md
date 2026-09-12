# Sales & Purchase Error Codes (from official Technical Spec v1.12)

Use these to map FBR's `errorCode` to a clear, actionable message in the invoice UI, rather than showing the raw error string. Full authoritative list — deduplicated from the source PDF (which repeats many rows).

## Sales invoice errors (selected, most relevant to this app)

| Code | Meaning | UI-friendly message |
|---|---|---|
| 0001 | Seller not registered for sales tax | Seller NTN/registration is not valid for sales tax — check business profile setup |
| 0002 | Invalid buyer registration no/NTN format | Buyer NTN must be 7/9 digits, or CNIC 13 digits |
| 0003 / 0011 | Invalid/missing invoice type | Select a valid invoice type (Sale Invoice / Debit Note) |
| 0005 / 0042 / 0043 / 0113 | Invalid/missing invoice date | Use `YYYY-MM-DD` format |
| 0009 / 0010 / 0012 | Missing buyer registration no. / name / registration type | Complete all required buyer fields before submitting |
| 0013 / 0092 | Invalid/missing sale type | Choose a valid Sale Type from the reference list |
| 0018 / 0023 / 0031 | Missing Sales Tax / FED | Sales Tax field is required |
| 0019 / 0044 | Missing HS Code | HS Code is required per line item |
| 0020 / 0046 | Missing rate | Select a valid rate for the chosen sale type |
| 0021 | Missing Value of Sales Excl. ST / Quantity | Both fields required per line item |
| 0026 / 0027 / 0028 | Missing invoice reference no. / reason / reason remarks (debit/credit note) | These are mandatory for Debit/Credit Notes |
| 0029 / 0035 / 0161 | Note date must be ≥ original invoice date | Debit/Credit note date validation |
| 0034 | Debit/credit note only allowed within 180 days of original invoice | Enforce this window in the UI before allowing note creation |
| 0036 / 0037 | Credit note value exceeds original invoice's value/ST withheld | Cap credit note amounts against the original invoice in the app before submission |
| 0052 | HS Code doesn't match the selected sale type | Validate HS Code against sale type client-side before posting |
| 0053 | Invalid buyer registration type | Must be exactly `"Registered"` or `"Unregistered"` |
| 0057 | Reference invoice does not exist (debit/credit note) | Reference invoice number is invalid |
| 0058 | Self-invoicing not allowed | Buyer and Seller registration number cannot be the same — **the duplicate/sanity check in this app should also block this before calling the API** |
| 0064 | Reference invoice already used by another credit note | Prevent re-using the same reference invoice for multiple credit notes |
| 0079 | Rate 5% not allowed if sales value > 20,000 | Enforce this rate/threshold rule client-side |
| 0088 / 0173 | Invoice number must be alphanumeric with `-` only between characters | Validate invoice number format before sending |
| 0096 / 0164 | Only KWH UOM allowed for this HS code | Restrict UOM options based on HS code (use HS_UOM reference API) |
| 0099 | UOM invalid for the given HS Code | Same as above — validate via HS_UOM reference API before submit |
| 0102–0105 | Calculated tax mismatch (3rd schedule / potassium chlorate / percentage / quantity) | These indicate the app's own tax calculation doesn't match FBR's expected formula — audit the rate engine logic |
| 0106 | Buyer not registered for sales tax | Same as 0001 but for buyer |
| 0300 | Decimal value invalid at a specific item field | Validate all numeric fields are properly formatted decimals before submission |
| 0401 | Seller NTN/CNIC has no valid/authorized token | Usually means wrong bearer token or NTN/CNIC format mismatch — check auth config |
| 0402 | Buyer NTN/CNIC has no valid/authorized token | Same as 0401 but buyer-side |

## Purchase invoice errors (selected)

Purchase error codes (0156–0177) largely mirror the sales error patterns but apply when the taxpayer is recording a **purchase** rather than a sale (e.g. STWH — sales tax withholding — scenarios). Key ones:

| Code | Meaning |
|---|---|
| 0156 | Invalid/null NTN or Registration No. |
| 0157 | Buyer (in this context, the recording party) not registered for sales tax |
| 0158 | Mismatched buyer registration number |
| 0159 | FTN holder cannot be recorded as seller for purchases |
| 0163 | Selected sale type not allowed for Manufacturer business nature |
| 0168 | Cotton Ginners purchase type only allowed for registered buyers |
| 0169 | STWH (sales tax withheld) invoices can only be created for GOV/FTN holders |
| 0170 | Rate 5% not allowed if Value of Sales Excl. ST > 20,000 (same rule as sales-side 0079) |

## App-level takeaway

Most of these errors are **preventable client-side** before ever calling `postinvoicedata` — build validation in the invoice form/duplicate-check layer (see `features-spec.md`) that checks: HS code validity for sale type, UOM validity for HS code (via HS_UOM reference API), rate thresholds (the 20,000/5% rule appears repeatedly), buyer/seller NTN format and self-invoicing check, and required fields per invoice type (debit note vs sale invoice). This reduces failed API calls and gives the user immediate feedback instead of a round-trip error.
