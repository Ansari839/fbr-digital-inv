# Suggested Next.js Architecture

This is a starting-point structure, not a rigid rule — adapt as the app grows, but keep the core separation: **PRAL integration isolated behind one module**, since that's the piece bound to a static IP and the piece most likely to need rework if hosting changes.

## Project structure

```
/app
  /(dashboard)
    /invoices
      /new                -> invoice creation screen (party lookup modal, address select, line items)
      /[id]                -> invoice detail: 72h bona-fide-mistake window + 180-day Debit/Credit Note window (two separate actions)
    /parties               -> party/customer management
    /items                 -> item master (HS code, UOM, stock)
    /stock
      /reconciliation      -> Annex H1 reconciliation view
    /settings
      /business-profile    -> issuer/branding page, per business unit
      /environment         -> sandbox/production toggle, token status
  /api
    /fbr
      /party-lookup        -> internal route calling Eviv/STATL (server-side only)
      /invoice
        /validate          -> proxies to validateinvoicedata(_sb)
        /post              -> proxies to postinvoicedata(_sb)
      /reference-data      -> provinces, UOM, HS codes (cacheable)

/lib
  /fbr
    client.ts              -> single PRAL API client: base URL switch (sandbox/prod), auth header, retry/backoff
    types.ts                -> shared TypeScript types for FBR payloads/responses
    duplicate-check.ts     -> business-rule duplicate detection logic
    offline-queue.ts       -> queue + retry logic for failed submissions
  /stock
    reconcile.ts            -> Annex H1 comparison logic

/prisma
  schema.prisma
```

## Why isolate `/lib/fbr/client.ts`

- Single place that knows about sandbox vs production URLs and tokens.
- Single place that needs to run from the static-IP-bound execution path (see `pral-integration.md#static-ip`) — if the rest of the app is serverless/edge but this module must run from a fixed VPS, this boundary makes that split clean (e.g. this module could be the only thing behind an internal proxy service).
- Single place for audit logging every request/response.

## Data model sketch (Prisma-style)

```prisma
model BusinessUnit {
  id            String   @id @default(cuid())
  ntn           String
  strn          String?
  name          String
  logoUrl       String?
  addresses     PartyAddress[] // this business's own addresses, same shape as buyer addresses
  invoices      Invoice[]
  items         Item[]
}

model Party {
  id           String   @id @default(cuid())
  ntnOrCnic    String
  name         String
  isRegistered Boolean
  addresses    PartyAddress[]
  invoices     Invoice[]
}

model PartyAddress {
  id             String   @id @default(cuid())
  partyId        String?
  businessUnitId String?
  label          String   // e.g. "Manufacturing Unit - Karachi"
  addressLine    String
  province       String
  branchCode     String?
}

model Item {
  id             String   @id @default(cuid())
  businessUnitId String
  hsCode         String
  uom            String
  name           String
  defaultRate    Decimal
  stockQty       Decimal  @default(0)
}

model Invoice {
  id               String   @id @default(cuid())
  businessUnitId   String
  partyId          String
  partyAddressId   String
  environment      String   // "sandbox" | "production"
  fbrIrn           String?  // returned by FBR on success
  fbrTimestamp     DateTime? // returned by FBR on success; authoritative post time for BOTH the 72-hour bona-fide-mistake window (STGO 01/2026) and the 180-day Debit/Credit Note window
  status           String   // draft | pending | posted | failed | cancelled
  totalAmount      Decimal
  lineItems        InvoiceLineItem[]
  apiLogs          ApiLog[]
  createdAt        DateTime @default(now())
}

model InvoiceLineItem {
  id          String  @id @default(cuid())
  invoiceId   String
  itemId      String
  quantity    Decimal
  rate        Decimal
  hsCode      String
}

model ApiLog {
  id          String   @id @default(cuid())
  invoiceId   String?
  endpoint    String
  requestBody Json
  responseBody Json?
  statusCode  Int?
  createdAt   DateTime @default(now())
}
```

## Environment variables

```
FBR_SANDBOX_TOKEN=
FBR_PRODUCTION_TOKEN=
FBR_ENVIRONMENT=sandbox   # or "production" — explicit flag, don't derive from NODE_ENV
FBR_SANDBOX_BASE_URL=https://gw.fbr.gov.pk/di_data/v1/di
FBR_PRODUCTION_BASE_URL=https://gw.fbr.gov.pk/di_data/v1/di
FBR_REFERENCE_BASE_URL=https://gw.fbr.gov.pk/pdi/v1
FBR_STATL_BASE_URL=https://gw.fbr.gov.pk/dist/v1
DATABASE_URL=
```

## Hosting note (ties back to static IP requirement)

Default Next.js deploys (Vercel, most serverless platforms) do **not** give a static outbound IP by default. Decide early whether to:
- Deploy the whole app on a VM with a static IP, or
- Deploy normally but route only `/lib/fbr/client.ts` calls through a small dedicated proxy/VM with a static IP.

This decision affects the `/api/fbr/*` routes above — they should call through whichever path has the whitelisted IP, not call PRAL directly from wherever they happen to execute.
