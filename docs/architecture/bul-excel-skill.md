# Skill Specification: Bulk Excel Invoice Parser & FBR Payload Generator

## 🎯 Role & Objective
You are an expert backend engineer responsible for creating a resilient **Bulk Excel Invoice Upload and Transformation Engine**. Your primary task is to parse a multi-item flat row Excel template uploaded by users, validate the tax compliance structures according to FBR rules, group child items dynamically by their Parent Invoice Number, and output a valid JSON array matching the **FBR Digital Invoicing (DI) API Specification**.

---

## 🛠️ Operational Logic & Rules

### 1. Data Structure Alignment (Flat Row Mapping)
The system must support an Excel file where a single invoice containing multiple items spans across multiple consecutive rows. The parsing engine must identify these items and group them dynamically using the unique identifier `InvoiceNo`.

* **Invoice Grouping Key**: `InvoiceNo`
* **Condition**: If rows share identical `InvoiceNo` values, they belong to the same parent invoice context.
* **State Preservation**: The invoice header metadata (`InvoiceDate`, `BuyerNTN`, `BuyerCNIC`, `BuyerName`, `InvoiceType`) must be taken from the first occurrence of the unique `InvoiceNo`, while product metrics are appended to a nested `Items` list.

### 2. Validation & Quality Gates
Before generating payloads or initiating API loops, execute synchronous column validations:
* **Identification Rules**: Either `BuyerNTN` (Format: `7894561-2`) OR `BuyerCNIC` (Format: `42101-1234567-1`) must be present. Reject row processing if both are blank.
* **Tax Math Verification**: For each row, enforce:
  `SalesTaxAmount = Math.round(Quantity * UnitPrice * (SalesTaxRate / 100))`
  `TotalAmount = (Quantity * UnitPrice) + SalesTaxAmount`
* **Error Containment**: If a validation checkpoint fails on any line, do not reject the entire workbook. Quarantine the specific `InvoiceNo` context into an `errors` array alongside its explicit descriptive row error message and present it dynamically to the dashboard view.

---

## 📋 Target Excel Column Schema
Your processing engine must ingest and parse an Excel sheet structured with the exact header columns below:

| Column Header | Data Type | Validation Constraint | Description |
| :--- | :--- | :--- | :--- |
| `InvoiceNo` | String / Code | Required | Unique invoice sequence or bill index number |
| `InvoiceDate` | Date / String | Required (YYYY-MM-DD) | Operational date of invoice generation |
| `BuyerNTN` | String | Optional (Validate format) | Buyer's FBR National Tax Number registration code |
| `BuyerCNIC` | String | Optional (Validate format) | Buyer's National Identity Card number if un-registered |
| `BuyerName` | String | Required | Legal business name or consumer name string |
| `ItemName` | String | Required | Explicit inventory, product line, or service description |
| `Quantity` | Numeric | Required (Integer > 0) | Quantity units sold |
| `UnitPrice` | Numeric | Required (Float > 0) | Unit sales price before compounding taxation |
| `SalesTaxRate` | Numeric | Required (Percentage value, e.g., 18) | Statutory sales tax percentage scale applicable |

---

## 💻 Standard Implementation Code (Node.js & `xlsx` Library)

```javascript
const xlsx = require('xlsx');

/**
 * Parses flat row Excel data and transforms it into structured nested FBR multi-item API payloads.
 * @param {string} filePath - Absolute path to the uploaded .xlsx workbook file.
 * @returns {Object} Grouped valid payloads and captured format errors.
 */
function processBulkInvoiceUpload(filePath) {
    // Read local workbook context
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const invoiceRegistry = {};
    const errorLog = [];

    // Loop through raw spreadsheet rows sequentially
    sheetData.forEach((row, index) => {
        const rowNumber = index + 2; // Row indexing correction offset for header rows
        
        // 1. Mandatory Header Validations
        if (!row.InvoiceNo) {
            errorLog.push({ row: rowNumber, error: "Missing InvoiceNo column value." });
            return;
        }
        if (!row.BuyerNTN && !row.BuyerCNIC) {
            errorLog.push({ row: rowNumber, invoiceNo: row.InvoiceNo, error: "Requires either a valid BuyerNTN or BuyerCNIC profile." });
            return;
        }

        // 2. Extracted Calculations & Tax Balancing
        const quantity = parseFloat(row.Quantity) || 0;
        const unitPrice = parseFloat(row.UnitPrice) || 0;
        const taxRate = parseFloat(row.SalesTaxRate) || 0;

        const rowTotalValue = quantity * unitPrice;
        const calculatedTax = Math.round(rowTotalValue * (taxRate / 100));
        const calculatedTotalAmount = rowTotalValue + calculatedTax;

        // 3. Dynamic Multi-Item Nesting and Grouping Logic
        if (!invoiceRegistry[row.InvoiceNo]) {
            // Instantiate master object structural hierarchy
            invoiceRegistry[row.InvoiceNo] = {
                InvoiceNumber: String(row.InvoiceNo),
                InvoiceDate: row.InvoiceDate,
                BuyerNTN: row.BuyerNTN ? String(row.BuyerNTN) : null,
                BuyerCNIC: row.BuyerCNIC ? String(row.BuyerCNIC) : null,
                BuyerName: row.BuyerName,
                TotalSaleValue: 0,
                TotalTaxCharged: 0,
                TotalGrossAmount: 0,
                Items: [] // Child array containment zone
            };
        }

        // Append line items directly under matching tracking key
        invoiceRegistry[row.InvoiceNo].Items.push({
            ItemDescription: row.ItemName,
            Quantity: quantity,
            UnitPrice: unitPrice,
            TaxRate: taxRate,
            SalesTaxAmount: calculatedTax,
            TotalAmount: calculatedTotalAmount
        });

        // Dynamic rolling accumulation counters
        invoiceRegistry[row.InvoiceNo].TotalSaleValue += rowTotalValue;
        invoiceRegistry[row.InvoiceNo].TotalTaxCharged += calculatedTax;
        invoiceRegistry[row.InvoiceNo].TotalGrossAmount += calculatedTotalAmount;
    });

    return {
        validFbrPayloads: Object.values(invoiceRegistry),
        quarantinedErrors: errorLog
    };
}

module.exports = { processBulkInvoiceUpload };
```

---

## 🚀 FBR Target API Payload Format (Output Expectation)
The result array returned under `validFbrPayloads` must format exactly to this nested architectural schema before executing authorization headers or transmission loops:

```json
[
  {
    "InvoiceNumber": "INV-2026-001",
    "InvoiceDate": "2026-09-13",
    "BuyerNTN": "1234567-8",
    "BuyerCNIC": null,
    "BuyerName": "Alpha Corporate Solutions",
    "TotalSaleValue": 155000,
    "TotalTaxCharged": 27900,
    "TotalGrossAmount": 182900,
    "Items": [
      {
        "ItemDescription": "Laptop Dell Latitude",
        "Quantity": 1,
        "UnitPrice": 150000,
        "TaxRate": 18,
        "SalesTaxAmount": 27000,
        "TotalAmount": 177000
    },
      {
        "ItemDescription": "Wireless Optical Mouse",
        "Quantity": 2,
        "UnitPrice": 2500,
        "TaxRate": 18,
        "SalesTaxAmount": 900,
        "TotalAmount": 5900
      }
    ]
  }
]
```

## ⏱️ Execution & Concurrency Guidelines
1. Do not push the collective output array as a single bulk request since the FBR DI endpoint typically handles single transaction submissions.
2. Implement an asynchronous batch wrapper (e.g., using `p-limit` or chunked intervals) to fire multiple parallel validation streams toward FBR servers using the individual customer tokens.
3. Update state machine registries inside database rows (`Pending` -> `Success` / `Failed`) immediately on standard FBR response.