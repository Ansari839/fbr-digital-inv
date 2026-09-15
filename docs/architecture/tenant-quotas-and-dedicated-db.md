---
name: tenant-quotas-and-dedicated-db
description: Use this skill when implementing pricing tiers, usage limits, or a client's request for dedicated/isolated infrastructure in a multi-tenant app. Covers app-level quota enforcement and the escalation path from shared DB to schema-per-client to fully dedicated VPS+DB. Companion to the multi-tenant-db-isolation skill — read that one first for the base isolation pattern this builds on.
---

# Tenant Quotas & Dedicated Database Escalation

## Two different problems — don't conflate them

1. **"Limit how much a client can use"** → this is a **quota** problem. Solved entirely in application code. No infrastructure change needed.
2. **"Give a client physically separate storage"** → this is a **dedication** problem. Solved by escalating the client's data out of the shared database into its own schema, database, or server.

Default to quotas for pricing/fair-use control. Only reach for dedication when a specific client has a genuine reason (compliance, contractual isolation, or one tenant's load is degrading everyone else's performance).

## Part 1: Quotas (default approach — implement this for every tenant)

Add plan/limit fields directly on `BusinessUnit`:

```prisma
model BusinessUnit {
  id                  String   @id @default(cuid())
  // ...existing fields (ntn, tokens, environment, etc.)
  planTier            String   @default("starter") // "starter" | "growth" | "enterprise"
  maxInvoicesPerMonth Int      @default(100)
  maxStorageMb        Int      @default(500)
  maxItems            Int?     // null = unlimited
}
```

**Enforce before the action, not after.** Check the quota before creating an invoice/item, not as a cleanup job afterward:

```ts
async function assertInvoiceQuota(businessUnitId: string) {
  const business = await prisma.businessUnit.findUniqueOrThrow({ where: { id: businessUnitId } });
  const countThisMonth = await prisma.invoice.count({
    where: { businessUnitId, createdAt: { gte: startOfCurrentMonth() } },
  });
  if (countThisMonth >= business.maxInvoicesPerMonth) {
    throw new QuotaExceededError(`Monthly invoice limit (${business.maxInvoicesPerMonth}) reached. Upgrade plan to continue.`);
  }
}
```

Call this inside the same request handler that creates the invoice, before calling the FBR API — never let a quota-exceeded client burn an FBR API call that will just be discarded.

**Storage quota** (if tracking uploaded logos, PDFs, etc.) needs a running total maintained on write, not computed by scanning all rows on every check — add a `storageUsedMb` counter on `BusinessUnit`, incremented/decremented whenever a file is added/removed.

**Surface quota state in the client dashboard** — show usage (e.g. "342 / 1000 invoices this month") so clients aren't surprised by a hard block. Warn at 80%, block at 100% with a clear upgrade prompt.

## Part 2: Dedication escalation path

When a client needs isolation beyond row-level (`businessUnitId`) scoping, escalate in this order — don't jump straight to the most expensive option:

### Level A: Schema-per-client (same DB server)

- Create a dedicated Postgres schema for the client (e.g. `client_acme`) containing the same table structure as the shared `public` schema.
- Migrate that client's existing rows out of the shared tables into the new schema.
- The app's data-access layer needs to know which schema to query for that client — route it via the `BusinessUnit` record (see the connection field pattern below), not a hardcoded schema name.
- Migrations must now run against every client schema that exists — plan for this in the deploy process (a migration runner that loops over known schemas), not a single `prisma migrate deploy` call.
- **When to use:** client wants "our data is physically separate" for a compliance letter, but doesn't need separate compute/performance.

### Level B: Database-per-client (same or different server)

- Provision a dedicated Postgres database (can be on the same VPS to start, or a separate one).
- Store the connection details on the `BusinessUnit` record so the app knows where to route that client's queries:

```prisma
model BusinessUnit {
  id                 String  @id @default(cuid())
  // ...
  dbConnectionString String? // null = use the shared default database; set = use this client's dedicated DB
}
```

```ts
// lib/db/connection-router.ts
async function getDbClientFor(businessUnitId: string) {
  const business = await sharedPrisma.businessUnit.findUniqueOrThrow({ where: { id: businessUnitId } });
  if (!business.dbConnectionString) return sharedPrisma; // default path — most clients
  return getOrCreateDedicatedClient(business.dbConnectionString); // cache these connections, don't reconnect per request
}
```

- **This is the pattern to build in from day one, even while every client is on the shared DB.** It costs almost nothing to add now and avoids an app-wide rewrite later — a new client dedication becomes a data-migration task, not an architecture change.
- **When to use:** client's data volume/load is large enough to affect other tenants, or they need independent backup/restore scheduling.

### Level C: Dedicated VPS + DB (full isolation)

- Separate VPS entirely, running its own copy of the app (or a routed instance) plus its own database.
- This client also needs **their own static IP** whitelisted in their own IRIS account — either a new VPS's IP, or an additional IPv4 address purchased on a shared VPS if compute isolation isn't the concern, only IP isolation is.
- Highest cost and operational overhead — reserve for enterprise clients with a specific contractual/compliance demand, not as a default upsell tier.

## Decision checklist before escalating a client

- [ ] Is the actual requirement "separate storage" (→ Level A schema) or "separate compute/performance" (→ Level B/C database or server)? Don't over-provision.
- [ ] Has the client actually asked for this, or is it a defensive assumption? Confirm the requirement in writing before doing migration work.
- [ ] Does the connection-routing pattern (`dbConnectionString` field) already exist in the codebase? If not, add it before doing the first migration — retrofitting it later while a client's data is mid-migration is riskier.
- [ ] Is there a rollback plan if the dedicated setup needs to be merged back into the shared DB later (e.g. client downgrades)?

## What never to do

- Never build dedicated-DB support as a one-off hack for a single client without the `dbConnectionString`-style routing field — the next client that needs it will require the same rework again.
- Never skip quota enforcement because "we'll add it before launch" — retrofitting usage limits after clients are already over them creates awkward conversations. Build it in from the first paying client.
- Never let a quota check happen after an FBR API call — always check before spending an external API call the client can't get back if they're over quota.
