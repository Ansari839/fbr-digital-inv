# PRAL / IRIS API Integration

## 1. Environments

| Environment | Endpoint pattern | Notes |
|---|---|---|
| Sandbox | `https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb` (and other endpoints with `_sb` suffix) | Safe for testing, doesn't touch real FBR records. Used to clear the 28 mandatory scenarios. |
| Production | `https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata` (no `_sb`) | Real invoices, real 22-digit FBR invoice number + QR. |
| Reference data | `https://gw.fbr.gov.pk/pdi/v1/...` | Provinces, UOM, HS codes, SRO items — same for sandbox/production. |
| STATL (Sales Tax Active Taxpayer status) | `https://gw.fbr.gov.pk/dist/v1/...` | Part of the DI reference/verification suite. |

Core endpoints (confirmed — these are the **only two** DI endpoints documented in the official Technical Spec v1.12, which was last updated July 2025):
- `validateinvoicedata` — pre-flight validation, no FBR record created.
- `postinvoicedata` — actual submission, returns FBR invoice number + timestamp.

**Correction mechanisms — two separate, coexisting rules (don't conflate them):**

1. **72-hour bona-fide-mistake window (legal rule, newer than the technical spec).** Per **FBR Sales Tax General Order (STGO) No. 01 of 2026**, dated 30 March 2026: an integrated person may **cancel, delete, or edit** a valid electronic sales tax invoice generated due to a **bona fide mistake**, through FBR's computerized system, within **72 hours** of generation. After 72 hours, any such change requires **prior approval of the Commissioner Inland Revenue**, "in such manner and subject to such conditions as may be specified by the Board." — Source: https://download1.fbr.gov.pk/Docs/2026331133557466STGO01of2026.pdf
   - **This postdates Technical Spec v1.12** (last updated 24-July-2025), so **no `cancelinvoicedata`-shaped endpoint is documented** in the spec this skill's payload schema is based on. Before implementing this feature, check for an updated technical spec from PRAL/FBR, or confirm with PRAL support (via the CRM portal — Section 6 below) whether this is exposed as an API or is currently only available manually through the IRIS portal.
   - Do not assume or invent an endpoint name/shape for this — flag it as "needs confirmation from PRAL" in the app's implementation notes until a technical document or PRAL support response confirms it.
2. **Debit Note / Credit Note (confirmed, documented in Technical Spec v1.12).** For genuine commercial adjustments (returns, discounts) — not for fixing a data-entry mistake in the original invoice. A new invoice with `invoiceType: "Debit Note"` and `invoiceRefNo` pointing at the original FBR invoice number, allowed within **180 days** of the original invoice date (error code 0034 enforces this). See `payload-schema.md` and `error-codes.md`.

Also relevant (separate from DI but same PRAL ecosystem):
- **Eviv (E-Verify Integrated Verification)** — real-time ATL/STATL status lookup by NTN or STRN. This is what powers the "party status" badge in the party lookup modal.

## 2. Getting sandbox access (step by step)

1. Business must already be **registered with FBR** for Sales Tax and/or Income Tax, with an active IRIS account (login at `iris.fbr.gov.pk`).
2. Log in to IRIS → find **Digital Invoicing** (menu label has moved around over the years; use IRIS's search bar and type "digital invoicing" if it's not visible directly).
3. Go to **Integration Mode** → select **"Proceed with PRAL as Licensed Integrator"** (free of cost) — or nominate a third-party Licensed Integrator (LI) instead if using one; if using an LI, the LI's team handles most of the steps below on your behalf.
4. Fill in **Technical Details**:
   - CRM user ID (email) + password (separate FBR-provided CRM system credentials — store securely, this is different from your IRIS login).
   - Business nature / sector — this determines which of the 28 sandbox test scenarios apply to you. Pick sector carefully; it drives what you're required to test.
5. Submit **IP Whitelisting** request (confirmed exact form fields from official manual):
   - Hosting Server Company Name, Hosting Server Country.
   - IP Address 1 (required), IP Address 2, IP Address 3 — **minimum 1, maximum 3** IPs entered directly, in IPv4 format (e.g. `192.168.1.1`).
   - **OR** upload an `.xls` file (max 1MB, using PRAL's downloadable sample template) if more IPs are needed than the 3-field form allows.
6. Submit. **PRAL Data Centre accepts or rejects the submitted IPs within 2 working hours**, and this automatically kicks off Sandbox testing on approval — no separate "start testing" step needed.
7. Once approved, go to **Sandbox Environment** in IRIS to view: Web API Environment Details, Sample JSON Format, Sample Code.
8. Post invoices for each assigned scenario (see `scenarios.md`) using the sandbox token on the `_sb` endpoints. **Minimum 1 successful invoice per assigned scenario is required.** The sandbox screen shows Total/Successful/Remaining scenario counts.
9. Once every assigned scenario has at least one successful invoice, **the Production Token is generated automatically** — no separate manual request. View it under **Production Environment** (View Production API Details / View Security Token). This is a separate token from sandbox — don't reuse the sandbox token in production code paths.

**If using a Licensed Integrator other than PRAL:** select "Other Licensed Integrators", pick the LI from the dropdown, and submit — the LI reviews and approves the application, and **PRAL does NOT perform IP whitelisting in this path**; the chosen LI handles that step instead. The rest of the flow is otherwise the same.

Have ready before starting: 7-digit NTN (companies/AOPs) or 13-digit CNIC (sole proprietors), STRN if sales-tax registered, and an active IRIS login. Use a desktop browser — the digital invoicing screens in IRIS are unreliable on mobile.

## 3. Static IP requirement — what it actually means for a Next.js app {#static-ip}

**Why it exists:** PRAL whitelists specific IPs allowed to call the DI gateway. Any request from a non-whitelisted IP is rejected outright — this has nothing to do with the bearer token being valid or not.

**Deployment options, compared (choose one deliberately, don't default to Vercel without thinking about this):**

| Option | How it works | Best for | Trade-off |
|---|---|---|---|
| **A. Deploy the whole app on a VPS/dedicated server** | Next.js runs on a VM with its own fixed IP (any provider — DigitalOcean, Linode, AWS EC2 with Elastic IP, Contabo, or a Pakistani VPS host). Standard PM2 + Nginx or Docker setup. | Small-to-medium single-business or few-branch apps — **recommended default for this app** unless it needs to scale to many tenants. | Lose Vercel-style zero-config deploys, edge caching, auto-scaling. |
| **B. Serverless app + static egress proxy** | Keep the Next.js app on Vercel/Netlify for fast deploys and scaling; route only the FBR-calling code (`/lib/fbr/client.ts`) through a small proxy service running on a static-IP VPS. | Apps that need to scale to many customers/tenants (SaaS-style). | More moving parts to maintain; the proxy itself becomes a dependency to monitor. |
| **C. Cloud static-egress-IP add-on** | Some cloud platforms offer a built-in static outbound IP / NAT Gateway for serverless functions (e.g. AWS Lambda + NAT Gateway with an Elastic IP). Vercel does not natively offer this. | Teams already committed to a specific cloud provider's serverless stack. | Provider-dependent; added fixed cost for the NAT Gateway; more infra to configure correctly. |

**Recommendation for this app:** default to **Option A** (whole app on a VPS) unless there's a clear multi-tenant/SaaS scaling need — it's the simplest to get right and to reason about for a compliance-critical integration. Confirm the VPS's final static IP **before** submitting the IP Whitelisting form in IRIS — changing hosting later means re-submitting whitelisting and waiting out PRAL's ~2-working-hour approval window again, during which invoices can't be posted.

**What needs the static IP — not your laptop, the production caller:**
- If the Next.js app runs its FBR API calls from **serverless/edge functions** (e.g. Vercel default), the outbound IP is *not static* and *not predictable* — this breaks PRAL whitelisting. This is the single most common integration mistake.
- Whichever option is chosen, **isolate all PRAL calls behind a single internal service/module** (see `references/architecture.md`) so the static-IP-bound egress path is the only thing that needs to change if hosting changes later.
- If an IP later changes (server migration, ISP change), you must **re-request whitelisting from PRAL** before invoices will post again — build an internal alert if invoice submissions start failing with connectivity/auth-looking errors, since it's often actually an IP mismatch, not a token problem.

## 4. Auth flow summary (confirmed from official Technical Spec v1.12)

- **Token validity is exactly 5 years.** On expiry, the taxpayer requests a new one via IRIS and PRAL auto-issues it.
- **One security token is used for both sandbox and production reference APIs** — the reference APIs (provinces, HS codes, UOM, etc. — see `reference-apis.md`) use the **same URL** regardless of environment; PRAL routes based on which token (sandbox vs production) is sent, not the URL.
- **The core Digital Invoicing API (post/validate) does use different URLs**: `_sb` suffix for sandbox, no suffix for production (e.g. `postinvoicedata_sb` vs `postinvoicedata`). Don't confuse this with the reference APIs' single-URL behavior.
- Header: `Authorization: Bearer <token>` (see official Postman example — literally the word "Bearer" followed by the token).
- Store encrypted, never in source control, never logged in plaintext.
- Keep sandbox and production tokens in separate env vars (`FBR_SANDBOX_TOKEN`, `FBR_PRODUCTION_TOKEN`) and gate which one is used by an explicit environment flag, not by NODE_ENV alone.
- **Sandbox → Production token flow (confirmed):** there is no separate manual "request production token" step for the core sandbox environment token. Once a taxpayer successfully submits a valid test invoice for a required scenario, the system **automatically generates the Production Token** in the background. The taxpayer views it later under the "Production Environment" tab (View Production API Details / View Security Token) once all required scenarios for their selected Business Nature + Sector are cleared (minimum 1 successful invoice per assigned scenario — see `scenarios.md`).

## 5. Error handling & reliability — IMPORTANT correction from official manual

- **FBR/PRAL does NOT support automatic retry for failed invoice submissions.** Per the official User Manual: *"The system does not support automatic retries for failed uploads; therefore, the invoice must be submitted again."* This means:
  - Any offline-queue / auto-retry behavior described in `features-spec.md` must be **built entirely in this app**, not assumed from FBR's side.
  - On connectivity failure, the app should mark the invoice as "failed/unsent" in its own dashboard, and the user (or an automated background job the app itself runs) must explicitly resubmit it — don't assume FBR will pick it up later.
  - Reconcile the local invoice dashboard against what PRAL actually accepted before resubmitting, to avoid creating true duplicates (see duplicate-detection logic in `features-spec.md`).
- Log every request/response pair (payload, response, IRN if returned, HTTP status, timestamp) for audit and dispute resolution — essential for diagnosing IP-whitelisting vs validation vs downtime failures, which look similar at first glance.
- HTTP status codes returned by both post and validate endpoints: `200` OK, `401` Unauthorized (bad/missing token — often actually an IP-whitelisting mismatch in disguise), `500` Internal Server Error (contact PRAL admin via CRM).
- Common validation failures to surface clearly in the UI (see `error-codes.md` for the full official list): invalid/unregistered buyer or seller NTN/CNIC, invalid or mismatched HS code for the sale type, missing rate/UOM, sales tax withheld not matching sales tax value, invalid invoice date format (`YYYY-MM-DD` required), self-invoicing (buyer = seller) not allowed.

## 6. Support / CRM (confirmed)

- Separate portal for support cases: **https://dicrm.pral.com.pk**
- Two login paths: Licensed Integrators log in with **IRIS** credentials (registration no. + password); taxpayers/their technical contact log in with **DI-Support** (the DI-registered email + password set during Technical Details step in IRIS).
- **5 failed login attempts blocks the ID** — worth noting for anyone managing this login on the taxpayer's behalf.
- Cases require Priority (High/Normal/Low), Query Type (Integration / Post Integration), Title, Description; attachments must be PDF (manual states 5MB per file in one section, FAQ states 20MB — treat 5MB as the safe assumption and confirm before relying on larger uploads).

## 7. Digital Invoicing logo & QR code (mandatory on every invoice)

- Every invoice PDF/print must carry the official **FBR Digital Invoicing System logo** and a **QR code**.
- QR code spec: **Version 2.0 (25×25)**, printed at **1.0 × 1.0 inch**.
- This belongs in the invoice PDF template (see `features-spec.md` Section 5, issuer/branding page) — it's a compliance requirement, not optional branding.
