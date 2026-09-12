---
name: fbr-invoicing-logic
description: Comprehensive skill detailing all FBR Digital Invoicing strict compliance rules, 72-hour limits, 10% deletion algorithms, and duplicate prevention. Use this whenever modifying the invoice creation, cancellation, or return filing logic in the Next.js app.
---

# FBR Digital Invoicing - Core Logic Skill

When developing features for the FBR Digital Invoicing Next.js Application, you MUST adhere to the following business logic and compliance rules. **Never bypass these in the code.**

## 1. Invoice Cancellation & 72-Hour Rule
- **The Timer**: Cancellation is only allowed within **72 hours** of the exact `fbrTimestamp` (not local creation time).
- **The Return Lock**: If the Sales Tax Return for that month is filed (`TaxReturnPeriod.isFiled == true`), the 72-hour rule is voided and the invoice is instantly **locked**.
- **Credit Note vs Cancel**: Warn users that cancellation is for *Bona Fide Mistakes* only. If goods were delivered and returned, they must use a Credit Note.
- **Offline Restriction**: An invoice cannot be canceled if it lacks an `fbrIrn`. It must be synced to FBR first.

## 2. The 10% Deletion Limit Algorithm
- **Rule**: A business cannot delete invoices totaling more than 10% of their *previous month's total sales*.
- **Implementation Check**: Before hitting the cancel API, calculate the sum of already canceled invoices this month + the current invoice's total. Compare this against `(Previous Month TaxReturnPeriod.totalSales * 0.10)`.
- If it exceeds, show a strict warning to the user or block the action, as FBR will reject the API call.

## 3. Duplicate Prevention
- FBR API does not prevent exact duplicate submissions; it will just generate a new IRN.
- You must always pass the payload through `checkDuplicateInvoice()` locally.
- **Exact Matches**: Same date, same buyer NTN, same total, same items -> Block.
- **Partial Matches**: Same date, same buyer -> Warn.

## 4. API Error Handling
- FBR does not auto-retry failed invoices.
- Always check `validationResponse.status`. If not `Success`, extract the `errorCode` from the response (both header and line-item levels) and display it clearly to the user.
- Always log the raw request and response in the `ApiLog` table for audit purposes.
