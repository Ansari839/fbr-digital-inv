# FBR Digital Invoicing Next.js App - Documentation

This application integrates with the Pakistan Federal Board of Revenue (FBR) PRAL Digital Invoicing API (IRIS). It is built with Next.js 15, Prisma (PostgreSQL), and Shadcn UI.

## Key Features & Core Logics

### 1. Digital Invoice Generation & Validation
- **Endpoints Used**: `validateinvoicedata` (pre-flight check) and `postinvoicedata` (actual submission).
- **Environment Support**: Separate logic and tokens for Sandbox (`_sb`) and Production. Toggleable via UI and `.env`.
- **Idempotency & Duplication Rules**:
  - The FBR API *does not* natively block duplicates if an invoice with the same details is posted twice (it assigns a new FBR Invoice Number).
  - **Local Prevention**: The app uses a local Prisma `duplicate-check.ts` service before hitting FBR. It prevents exact duplicates (same date, amount, items, buyer) and warns on partial duplicates.

### 2. 72-Hour "Bona Fide Mistake" Correction Window
- **Rule**: An integrated person may cancel, edit, or delete an invoice generated due to a bona fide mistake within **72 hours** of issuance. After 72 hours, it requires formal approval from the Commissioner Inland Revenue (STGO No. 01 of 2026).
- **Implementation**: The system calculates the remaining time starting strictly from the `fbrTimestamp` returned by FBR. The UI actively displays a countdown timer. Once the timer reaches 0, the invoice is locked locally.

### 3. Strict 10% Deletion Limit
- **Rule**: The total value of deleted/canceled invoices in a month cannot exceed **10% of the total sales declared in the previous month's Sales Tax Return**.
- **Implementation**: Before confirming a cancellation, the app sums the value of already canceled invoices for the current month. If the new cancellation exceeds the 10% limit of the previously locked month's `totalSales`, it issues a strong warning / block to prevent FBR API rejection.

### 4. Active Sales Tax Return Lock (Month Lock)
- **Rule**: If a monthly Sales Tax Return (Annexure-C) is filed, all invoices for that month are permanently frozen, even if the 72-hour window has not expired.
- **Implementation**: The app includes a "Lock Month" feature. When activated, it creates a `TaxReturnPeriod` record and sets `isFiled = true`. All invoices within that month immediately enter a "Locked/Confirmed" state.

### 5. Credit Note vs. Cancellation
- **Rule**: Cancellation is *only* for punch errors before goods delivery. If goods are returned (Sales Return), a **Credit Note** must be issued instead.
- **Implementation**: The UI explicitly warns the user about this distinction when they attempt to cancel an invoice, ensuring they don't misuse the cancellation API for sales returns.

### 6. Offline Modification Restriction
- **Rule**: If the app generates invoices offline due to connectivity issues, they cannot be modified or canceled on the FBR portal until they are synchronized and receive an FBR IRN.
- **Implementation**: The UI disables the "Cancel" and "Edit" buttons if the invoice record lacks an `fbrIrn`.

## Database Schema (Prisma)
- **BusinessUnit & Party**: Core entities managing issuer and buyer profiles.
- **Invoice & InvoiceLineItem**: Stores all invoice data locally. `fbrIrn` and `fbrTimestamp` are populated upon successful FBR sync.
- **TaxReturnPeriod**: Stores the filed status and total sales per month to enforce the 10% deletion limit.
- **ApiLog**: Full audit trail of all JSON payloads sent to and received from FBR for compliance.
