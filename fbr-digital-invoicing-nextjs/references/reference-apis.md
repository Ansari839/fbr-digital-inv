# Digital Invoicing Reference (Lookup) APIs

These are GET endpoints used to populate dropdowns and validate fields in the invoice form (province, HS code, UOM, rate, etc.). **Same URL for sandbox and production** — PRAL routes based on which bearer token (sandbox or production) is sent, unlike the core post/validate endpoints which have separate `_sb` URLs.

Cache these locally (e.g. refresh daily) rather than calling on every keystroke — they're reference/master data, not transactional.

| API | Method | URL | Input | Key response fields |
|---|---|---|---|---|
| Provinces | GET | `https://gw.fbr.gov.pk/pdi/v1/provinces` | none | `stateProvinceCode`, `stateProvinceDesc` |
| Document Type | GET | `https://gw.fbr.gov.pk/pdi/v1/doctypecode` | none | `docTypeId`, `docDescription` (e.g. "Sale Invoice", "Debit Note") |
| Item/HS Code | GET | `https://gw.fbr.gov.pk/pdi/v1/itemdesccode` | none | `hS_CODE`, `description` |
| SRO Item ID | GET | `https://gw.fbr.gov.pk/pdi/v1/sroitemcode` | none | `srO_ITEM_ID`, `srO_ITEM_DESC` |
| Transaction Type | GET | `https://gw.fbr.gov.pk/pdi/v1/transtypecode` | none | `transactioN_TYPE_ID`, `transactioN_DESC` |
| UOM | GET | `https://gw.fbr.gov.pk/pdi/v1/uom` | none | `uoM_ID`, `description` |
| SRO Schedule | GET | `https://gw.fbr.gov.pk/pdi/v1/SroSchedule?rate_id=413&date=04-Feb-2024&origination_supplier_csv=1` | `rate_id`, `date`, `origination_supplier_csv` as query params | `srO_ID`, `srO_DESC` |
| Rate (Sale Type → Rate) | GET | `https://gw.fbr.gov.pk/pdi/v2/SaleTypeToRate?date=...&transTypeId=...&originationSupplier=...` | `date`, `transTypeId`, `originationSupplier` (province id) as query params | `ratE_ID`, `ratE_DESC`, `ratE_VALUE` |
| HS Code with UOM | GET | `https://gw.fbr.gov.pk/pdi/v2/HS_UOM?hs_code=...&annexure_id=...` | `hs_code`, `annexure_id` as query params | `uoM_ID`, `description` — **use this to restrict the UOM dropdown to only valid UOMs for the selected HS code** |
| SRO Item ID (by SRO) | GET | `https://gw.fbr.gov.pk/pdi/v2/SROItem?date=...&sro_id=...` | `date`, `sro_id` as query params | `srO_ITEM_ID`, `srO_ITEM_DESC` |
| STATL (party status check) | GET | `https://gw.fbr.gov.pk/dist/v1/statl` | body: `{"regno":"...", "date":"YYYY-MM-DD"}` | `{"status code": "01"/"02", "status": "In-Active"}` — see note below |
| Registration Type (Get_Reg_Type) | GET | `https://gw.fbr.gov.pk/dist/v1/Get_Reg_Type` | body: `{"Registration_No":"..."}` | `statuscode`, `REGISTRATION_NO`, `REGISTRATION_TYPE` (`"Registered"` or `"unregistered"`) |

## STATL / party-status lookup — implementation note

This is the endpoint behind the **party lookup modal** feature (`features-spec.md` Section 1):

- Call `Get_Reg_Type` first to determine if the NTN/CNIC is Registered or Unregistered — this maps directly to the `buyerRegistrationType` field in the invoice payload.
- Call `statl` to get the Active Taxpayer status. Response only distinguishes status codes `01`/`02`, both currently observed returning `"In-Active"` in the sample docs — **treat any non-active-confirming response as inactive/unverified and surface it clearly**; don't assume a specific status code means "active" without testing against the live sandbox, since the official sample only shows the inactive case.
- Both calls should happen live at party-selection time in the modal, not from a cache — status changes in real time per FBR.

HTTP status codes for all reference APIs: `200` OK, `401` Unauthorized, `500` Internal Server Error.
