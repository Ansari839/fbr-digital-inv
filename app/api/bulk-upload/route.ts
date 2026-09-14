import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse the excel file
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];

    const invoiceRegistry: Record<string, any> = {};
    const errorLog: any[] = [];

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

    return NextResponse.json({
        validFbrPayloads: Object.values(invoiceRegistry),
        quarantinedErrors: errorLog
    });

  } catch (error: any) {
    console.error('Error parsing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
