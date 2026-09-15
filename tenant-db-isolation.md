---
name: multi-tenant-db-isolation
description: Use this skill whenever writing or reviewing database queries, Prisma schema, API routes, or auth/session code for a multi-tenant app (multiple clients/businesses sharing one database). Applies to the FBR Digital Invoicing app and any other multi-tenant Next.js + Prisma project. Prevents cross-client data leaks.
---

# Multi-Tenant Database Isolation

## The core rule

**Every table that holds client-specific data has a `businessUnitId` (tenant ID) column. Every single query against that table MUST filter by it. No exceptions, no "just this once."**

Data mixup between clients isn't a minor bug in this app — it's a compliance and trust failure (Client A seeing Client B's invoices, NTNs, or FBR tokens). Treat every query touching tenant data as a security-sensitive operation.

## Isolation strategy for this app: shared database, row-level isolation

There are three common multi-tenancy patterns. This app uses the first one — the others are noted so the agent doesn't accidentally reach for them:

| Pattern | What it means | Use it when |
|---|---|---|
| **Row-level isolation (chosen for this app)** | One database, one set of tables. Every tenant-owned row has a `businessUnitId` column. Queries filter by it. | Default choice — cheapest, simplest, scales to dozens/hundreds of tenants on one VPS. |
| Schema-per-tenant | One database, separate schema per tenant. | Only if a specific client needs stronger data separation for contractual/compliance reasons. Adds real operational complexity (migrations run N times). Don't reach for this by default. |
| Database-per-tenant | Fully separate database per tenant. | Only for a client demanding total physical isolation, usually paired with a dedicated server for them. Expensive to operate at scale. |

**Do not mix strategies within one app without a deliberate, documented reason.**

## Enforcement layers (defense in depth — use all three, not just one)

### Layer 1: Every tenant table has a `businessUnitId` foreign key

```prisma
model Invoice {
  id             String   @id @default(cuid())
  businessUnitId String   // tenant ID — required on every tenant-owned table
  businessUnit   BusinessUnit @relation(fields: [businessUnitId], references: [id])
  // ...other fields
  @@index([businessUnitId]) // every tenant table needs this index — every query filters on it
}
```

Apply this to: `Invoice`, `Party`, `PartyAddress`, `Item`, `ApiLog`, and any other table holding client-specific data. Shared reference data (HS codes, provinces, UOM — pulled from FBR's reference APIs) does NOT need this, since it's the same for everyone.

### Layer 2: Never write a raw query without a tenant filter — enforce this at the ORM layer, not by developer discipline alone

Relying on "remember to add `where: { businessUnitId }` every time" fails eventually. Instead, wrap all tenant-table access through a scoped client so it's structurally impossible to forget:

```ts
// lib/db/tenant-scope.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Call this at the start of every authenticated request handler.
// Never construct a raw `prisma.invoice.findMany()` directly in route code for tenant tables.
export function scopedDb(businessUnitId: string) {
  return {
    invoice: {
      findMany: (args: Parameters<typeof prisma.invoice.findMany>[0] = {}) =>
        prisma.invoice.findMany({ ...args, where: { ...args.where, businessUnitId } }),
      findUnique: (id: string) =>
        prisma.invoice.findFirst({ where: { id, businessUnitId } }), // findFirst, not findUnique — must be able to filter by tenant too
      create: (data: Omit<Parameters<typeof prisma.invoice.create>[0]['data'], 'businessUnitId'>) =>
        prisma.invoice.create({ data: { ...data, businessUnitId } }),
      // ...update/delete follow the same pattern
    },
    party: { /* same pattern */ },
    item: { /* same pattern */ },
  };
}
```

Every API route derives `businessUnitId` from the **authenticated session**, never from a request body, query param, or header the client controls:

```ts
// app/api/invoices/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(); // whatever auth this app uses
  if (!session) return new Response('Unauthorized', { status: 401 });

  const db = scopedDb(session.businessUnitId); // tenant ID comes from the session, not from the request
  const invoices = await db.invoice.findMany();
  return Response.json(invoices);
}
```

**Red flag to catch in code review:** any route handler that reads a `businessUnitId` (or `clientId`, `tenantId`, etc.) from `req.body`, `req.query`, or a URL param and uses it to scope a query. A malicious or buggy client could pass someone else's ID. The tenant ID must always come from server-side session state that the client cannot forge.

### Layer 3 (extra safety net): Postgres Row Level Security (RLS)

If using Postgres, add RLS policies as a last line of defense — even if application code has a bug, the database itself refuses to return another tenant's rows:

```sql
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Invoice"
  USING ("businessUnitId" = current_setting('app.current_tenant')::text);
```

The app sets `app.current_tenant` at the start of each request/transaction (via `SET LOCAL app.current_tenant = '<id>'`, scoped to a Postgres transaction so it never leaks across requests on a pooled connection). This is optional but recommended once the app has real customer data — it catches the "forgot to filter" bug class at the database level instead of relying entirely on application code.

## Admin/super-admin access (the one legitimate exception)

The admin dashboard (see `architecture.md`) needs to see across all tenants — that's its job. Keep this separate and explicit:

- A distinct `isSuperAdmin` flag on the user/session model, checked explicitly before allowing an unscoped query.
- Super-admin queries go through a **separate, clearly-named function** (e.g. `adminDb.invoice.findAllAcrossTenants()`), never the same `scopedDb()` helper — so it's visually obvious in code review when a query is intentionally cross-tenant versus a scoping bug.
- Log every cross-tenant admin query (who, when, what) — this is sensitive access and should be auditable.

## Testing checklist before shipping any new tenant-data feature

- [ ] Create two test tenants (Business A, Business B) with overlapping-looking data (e.g. both have an invoice #1).
- [ ] Log in as Business A, confirm you cannot see, edit, or delete anything belonging to Business B — including by guessing/incrementing IDs in the URL (`/invoices/123` where 123 belongs to Business B should 404, not show data).
- [ ] Check every new API route: does the tenant ID come from the session, or did it sneak in from the request?
- [ ] Check every new Prisma query: does it go through `scopedDb()`, or is it a raw `prisma.X.findMany()` call that bypassed the tenant filter?
- [ ] If using RLS, confirm the policy is enabled on the new table too — it's easy to forget on a newly added table.

## What never to do

- Never trust a `businessUnitId`/`tenantId` value that arrives from the client (body, query string, header, cookie value the client could tamper with) — only from server-verified session state.
- Never write a raw `prisma.invoice.findMany()` (or equivalent) directly in route/feature code without going through the tenant-scoped wrapper.
- Never share a single API token (FBR bearer token, etc.) across tenants "to save time" — each `BusinessUnit` row has its own `fbrSandboxToken`/`fbrProductionToken`, looked up per request.
- Never let a bug-fix or hotfix skip the scoping layer "just this once, we'll fix it properly later" — this is exactly the kind of shortcut that causes real data leaks.
