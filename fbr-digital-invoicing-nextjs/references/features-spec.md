# Feature Specification

## 1. Party / NTN lookup modal (invoice creation)

- On the invoice creation screen, when the user types/pastes a party's NTN (or CNIC), open a modal showing:
  - Registered name, registration type, RTO.
  - **ATL/STATL status** as a clear badge (Active / Inactive), fetched live via Eviv/STATL — never from a cache older than the current session.
  - A **confirm button** ("Ha yeh party hai") that commits the party to the invoice only after explicit confirmation — don't auto-fill silently, since a mistyped NTN could pull the wrong party.
- If NTN is invalid/unregistered, show a clear inline error, don't let the invoice proceed with an unverified party unless the user explicitly marks the sale as "unregistered buyer" (a legitimate FBR invoice type).

## 2. Multi-business-address selection

- A single NTN/company can have multiple registered business addresses/activity types (e.g. manufacturing unit, retail outlet, warehouse) each potentially with a different address and branch code.
- After party confirmation, if more than one address exists for that NTN, show a **select dropdown**: "Kis address/business par invoice issue karni hai."
- Store the selected address/branch against the invoice so it appears correctly on the printed invoice and in FBR's payload's seller/buyer address fields.
- Data model implication: a `Party` has many `PartyAddress` rows, not a single address field.

## 3. Invoice correction UI — two separate windows, don't merge them

**A. 72-hour bona-fide-mistake window (STGO 01/2026 — confirm exact API shape with PRAL before building)**

- Every invoice row should show a **live countdown** of time remaining in the 72-hour window for cancel/edit/delete due to a genuine mistake.
- **Base the countdown on the FBR-returned timestamp** from `postinvoicedata` (`fbrTimestamp`), not local post time.
- Once expired, the UI should switch the action to **"Requires Commissioner IR approval"** rather than a simple edit/cancel button, since STGO 01/2026 requires that approval after 72 hours — this is a manual/offline approval process the app can't automate, but it should be reflected honestly in the UI (e.g. a note + contact/process guidance) rather than silently disabling the action.
- **Before writing the API call for this**, confirm with PRAL (via CRM — see Section 6 of `pral-integration.md`) or a technical spec newer than v1.12 what the actual endpoint/mechanism is. Don't invent an endpoint name.

**B. Debit/Credit Note — 180-day commercial adjustment window (confirmed in Technical Spec v1.12)**

- For returns, discounts, or other genuine post-sale commercial adjustments — **not** for fixing a data-entry mistake (that's mechanism A above).
- Issue via a new invoice: `invoiceType: "Debit Note"`, `invoiceRefNo` set to the original invoice's FBR invoice number.
- Allowed within 180 days of the original invoice date; note date must be ≥ original invoice date (error codes 0029/0034/0035/0161).
- A Credit Note's value cannot exceed the original invoice's value of sale / ST withheld (error codes 0036/0037) — validate client-side before submission.
- One reference invoice can only be used by one credit note (error code 0064) — track this in the app's data model.
- `Reason` (and `Reason Remarks` if "Others" is selected) are mandatory fields (error codes 0027/0028) — include a reason selector in the note-creation form.
- Show days remaining in the 180-day window per invoice; disable "Issue Debit/Credit Note" once expired (fail closed in the UI, don't rely solely on the API's rejection).

## 4. Duplicate invoice detection (client-side business rule)

- FBR's API does **not** prevent duplicate submissions — this must be built into the app.
- Before calling `postinvoicedata`, check for existing invoices matching: same buyer NTN + same invoice date + same total amount, and compare line items (HS code + quantity + rate) for overlap.
- **Exact match** (same buyer, date, items, amounts) → hard-block submission with a clear message, require the user to explicitly override (e.g. type "CONFIRM DUPLICATE") if it's a genuine repeat sale.
- **Partial/fuzzy match** (same buyer + same day, similar-but-not-identical amount) → soft warning banner, allow proceeding without extra friction.
- Log overridden duplicates separately for later audit review.

## 5. Issuer / branding profile page

- A settings page per business unit storing: company/business name, logo, registered address, NTN/STRN, contact info, default bank details (optional, for display on invoice PDFs).
- If the company operates multiple business units under one NTN (see Section 2), allow **per-branch branding** — separate logo/letterhead per business address if they operate as distinct brands.
- This data feeds the printed/PDF invoice template, not the FBR payload itself (FBR payload uses registration data, not branding).

## 6. HS-code-wise stock management + Annex H1 reconciliation

- Item master: each item has HS Code, UOM, default sales rate, and current stock quantity.
- Stock **decrements automatically** when an invoice is posted (successfully accepted by FBR), and can be **incremented via manual stock-in / purchase entry**.
- Build a **reconciliation view** comparing system stock movements against the **Annex H1** stock statement (the sales-tax stock declaration) — flag mismatches between what the software thinks is in stock and what's been declared.
- **Negative stock handling**: default to blocking the invoice from posting if it would take an item negative, with an explicit override path for authorized roles (manager approval) — don't hard-block for every business, since some legitimately invoice before physical stock-in is recorded (e.g. drop-shipping). Make this a configurable setting per business.

## 7. Additional recommended features

- **Offline queue** — see `pral-integration.md` Section 5; queue invoices locally when API/network fails, auto-retry within FBR's 24-hour window.
- **API audit log** — every request/response logged (payload, IRN, status, timestamp) for compliance and dispute resolution.
- **Bulk invoice import** (CSV/Excel) — for higher-volume retail/POS use cases.
- **Role-based access control** — who can post invoices, who can issue Debit/Credit Notes, who can approve negative-stock overrides, especially important with multiple business units under one account.
- **Reconciliation dashboard** — daily comparison of locally recorded invoices vs FBR's record of what was actually accepted; surface rejected/mismatched invoices prominently.
- **Debit/credit note workflow** — see Section 3 above; linked to the original invoice, respecting the 180-day window and one-note-per-reference-invoice rule.
- **Automatic tax rate engine** — sales tax rate can vary by buyer's registration type/province; compute rather than rely on manual entry.
- **Notifications** — WhatsApp/email/SMS alerts for: a Debit/Credit Note's 180-day window about to close, API submission failures needing manual resubmission (see `pral-integration.md` — FBR does not auto-retry), IP-whitelisting-looking errors, negative stock attempts.
- **Token/connectivity health monitor** — proactive check that the bearer token and PRAL gateway are reachable, so failures are caught before a burst of invoices fail at point of sale.
- **Sandbox/production toggle** — visible, explicit environment switch in the UI/admin settings, especially important when onboarding a new business unit that hasn't gone live yet while others are already in production.
