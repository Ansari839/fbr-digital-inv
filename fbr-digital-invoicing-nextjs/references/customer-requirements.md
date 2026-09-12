# Customer / Business Requirements Checklist

Everything that must be collected from the business (the taxpayer using this app) before or during onboarding — separate from what the app itself needs to build. Use this as an onboarding intake checklist.

## 1. Registration & access

- [ ] Active FBR **IRIS** account, registered with **NTN** (7 digits, companies/AOPs) or **CNIC** (13 digits, sole proprietors), and **STRN** if Sales Tax registered.
- [ ] IRIS **login credentials** (Registration No. + Password) — stays with the customer; this app's operators set up integration on their behalf but shouldn't need to "own" this login long-term.
- [ ] A **CRM User ID (email) + Password** created during the IRIS Technical Details step — this is a separate login for PRAL's support portal (dicrm.pral.com.pk), distinct from IRIS itself.

## 2. Business classification (drives sandbox testing scope)

- [ ] **Business Nature** (one or more): Manufacturer, Importer, Exporter, Distributor, Wholesaler, Retailer, Service Provider, Other.
- [ ] **Sector** (pick one, for sandbox testing only): Textile, Steel, FMCG, Telecom, Petroleum, Electricity/Gas Distribution, Services, Automobile, CNG Stations, Pharmaceuticals, Wholesale/Retail, All Other Sectors.
- [ ] Confirm whether registered as a **retailer** in the sales tax profile specifically — this unlocks scenarios SN026–SN028 (see `scenarios.md`).

## 3. Infrastructure

- [ ] **Static outbound IP** of wherever this app will be hosted (see `pral-integration.md` Section 3 for deployment options) — needed for the IRIS IP Whitelisting form (up to 3 IPs directly, or an `.xls` upload for more).
- [ ] Hosting Server Company Name and Hosting Server Country — also required on the same IP Whitelisting form.
- [ ] Decision on hosting approach locked in **before** submitting whitelisting (re-whitelisting after a hosting change costs another ~2-working-hour approval cycle with no invoicing in between).

## 4. Branding & document assets

- [ ] Company logo (and per-branch logos if operating multiple distinctly-branded business units under one NTN).
- [ ] Registered business address(es) — one per branch/business unit if there's more than one.
- [ ] Bank details, if the business wants them shown on the invoice PDF.
- [ ] Confirm the app's invoice template includes the **mandatory FBR Digital Invoicing logo + QR code** (version 2.0, 25×25, 1.0×1.0 inch — see `pral-integration.md` Section 7) — this isn't optional branding, it's a compliance requirement on every issued invoice.

## 5. Product/item & stock master data

- [ ] Full item list with **HS Codes** (validate each against the reference API — `reference-apis.md` — before seeding).
- [ ] Default sales rate and applicable tax rate per item/category.
- [ ] Valid **UOM** per item (must match what the HS_UOM reference API allows for that HS code).
- [ ] Opening stock quantities per item, if HS-code-wise stock tracking (`features-spec.md` Section 6) is in scope for this customer.

## 6. Process & staffing decisions (worth clarifying with the customer up front)

- [ ] Who will be the **Technical Contact Person** listed in IRIS (name, mobile, email) — PRAL/the CRM contacts this person for integration issues.
- [ ] Who has authority to approve a **negative-stock override** if the app blocks it by default.
- [ ] Who is responsible for **manually resubmitting failed invoices** — FBR does not auto-retry (see `pral-integration.md` Section 5), so someone needs to own this operationally, or the app needs an internal automated resubmission job the business is comfortable relying on.
- [ ] Who handles the **72-hour bona-fide-mistake window** and, if it lapses, who liaises with the Commissioner Inland Revenue for approval (STGO 01/2026 — see `features-spec.md` Section 3A). This is a compliance/process question for the business, not something the app can fully automate.

## What the app team is responsible for (not the customer)

- Deployment/hosting decision and static IP provisioning (customer provides IP once decided, doesn't need to manage the server).
- All API integration work: IRIS registration walk-through, sandbox scenario testing, going live.
- Building/maintaining the audit log, duplicate-detection logic, reconciliation dashboard, and all the in-app compliance guardrails described in `features-spec.md`.
