---
name: fbr-digital-invoicing-nextjs
description: Build, extend, or debug a Next.js-based FBR (Pakistan Federal Board of Revenue) Digital Invoicing compliance app that integrates with PRAL's Digital Invoicing API (IRIS). Use this skill whenever the user is working on FBR e-invoicing software, PRAL API integration, NTN/STRN/ATL/STATL verification, sandbox-to-production go-live, HS code stock management, Annex H1 reconciliation, the 72-hour bona-fide-mistake correction window (STGO 01/2026), Debit/Credit Note workflow, or any feature of this specific invoicing product (party lookup modal, multi-business-address selection, duplicate invoice detection, issuer profile/branding page). Always consult this skill before writing code for this app so architecture, data model, and compliance rules stay consistent across sessions.
---

# FBR Digital Invoicing App (Next.js)

A Next.js application that lets a business issue FBR-compliant digital invoices in real time via PRAL's Digital Invoicing API, and manage everything around that: party/NTN lookups, ATL/STATL status, multi-branch invoicing, stock/HS-code management, and Debit/Credit Note corrections.

This SKILL.md is the source of truth for the product spec. Read the relevant `references/` file before implementing a feature area. Keep this file and the references updated as decisions change — treat it like a living PRD + architecture doc, not a one-time brief.

## How to use this skill

1. Before writing code for any feature, check which reference doc covers it (list below) and read it.
2. When the user asks for something new, first check if it fits into the existing data model / module structure described here. Propose additions to this SKILL.md rather than silently diverging.
3. Never hardcode sandbox or production secrets (bearer tokens, NTNs) in code — always via environment variables (see `references/architecture.md`).
4. Every feature that touches the PRAL API must handle: sandbox vs production endpoint switching, retry/offline-queue behavior, and response logging (see `references/pral-integration.md`).

## Reference files

- `references/pral-integration.md` — PRAL/IRIS API details: sandbox vs production, endpoints, auth/token flow (5-year token validity, sandbox→production auto-generation), static IP whitelisting steps (exact form fields, 2-working-hour SLA), licensed integrator process, error handling (no auto-retry — must be built in-app), CRM support portal, QR/logo printing spec. **Read this before touching any API call code.**
- `references/payload-schema.md` — Authoritative field-by-field schema for the `postinvoicedata`/`validateinvoicedata` JSON payload and response shapes, straight from the official Technical Spec v1.12. **Read this before building the invoice form, TypeScript types, or the PRAL API client.**
- `references/reference-apis.md` — All the GET lookup APIs (provinces, HS codes, UOM, rates, SRO, STATL, registration-type) with exact URLs and query params — powers dropdowns and the party lookup modal's ATL/STATL badge. **Read this before building the party lookup modal or any dropdown that should pull from FBR reference data.**
- `references/error-codes.md` — Official sales & purchase error codes mapped to plain-language messages, with a note on which validations should be done client-side before ever calling the API. **Read this when building form validation or an error-handling layer.**
- `references/scenarios.md` — The SN001–SN028 sandbox testing scenarios and how Business Activity + Sector determine which ones a taxpayer must clear. Mostly relevant for internal onboarding/checklist tooling, not for the production invoice flow itself.
- `references/customer-requirements.md` — Consolidated onboarding checklist: what must be collected from the business (IRIS credentials, business classification, static IP, branding assets, item/stock master data, staffing/process decisions) versus what the app team is responsible for. **Read this when scoping a new customer onboarding or a proposal/SOW.**
- `references/features-spec.md` — Full feature specification for the app (party/NTN modal, multi-address selection, Debit/Credit Note correction workflow, duplicate detection, issuer profile, HS-code stock + Annex H1, plus the extra recommended features). **Read this before building or modifying any screen/module.**
- `references/architecture.md` — Suggested Next.js project structure, data model (Prisma schema sketch), env vars, and where each feature lives in the codebase.

## Quick facts to keep in mind at all times

- **Two environments**: sandbox (`*_sb` endpoints, testing NTNs) and production (no `_sb` suffix). A visible environment toggle in the app is required — never let sandbox and production tokens mix.
- **Static IP is mandatory.** PRAL whitelists the *server's* outbound static IP, not the developer's laptop. This has direct hosting implications for a Next.js app (see `references/pral-integration.md#static-ip`).
- **72-hour correction window (real — legal requirement, not from the technical spec).** Per **FBR Sales Tax General Order (STGO) No. 01 of 2026** (30 March 2026), an integrated person may cancel, delete, or edit a valid electronic sales tax invoice **generated due to a bona fide mistake**, through FBR's computerized system, **within 72 hours** of generation. After 72 hours, any such change requires **prior approval of the Commissioner Inland Revenue**. This is a separate, newer legal requirement than the Debit/Credit Note mechanism below — **the official Technical Spec v1.12 (last updated July 2025) predates this order and does not document a `cancelinvoicedata`-type endpoint**, so the exact API mechanics for this 72-hour cancel/edit/delete right are not yet confirmed from a technical document. Verify with PRAL/an updated technical spec (or via IRIS manually) before assuming a specific endpoint shape — don't hardcode an unconfirmed endpoint name.
- **Debit/Credit Note (confirmed in Technical Spec v1.12) — a separate mechanism for genuine commercial adjustments** (returns, discounts), not for correcting a data-entry mistake in the original invoice. Allowed within 180 days of the original invoice date (error code 0034). These two mechanisms coexist and serve different purposes — don't conflate them.
- **Duplicate detection is a business rule, not an FBR rule** — FBR's API does not stop you from submitting a duplicate. This must be implemented in the app's own layer before calling `postinvoicedata`.
- **No automatic retry on FBR's side either.** The official manual is explicit that failed submissions are not auto-retried by FBR — any offline queue/retry behavior has to be built entirely in this app.
- **STATL/ATL status changes in real time** — never cache a party's status for long; re-check at invoice-post time even if the party was checked earlier in the session.
- Treat any bearer token as a secret equivalent to a production database password — it's long-lived and NTN-scoped.
