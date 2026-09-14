import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function GET() {
  try {
    // Required headers for FBR Bulk Upload
    const headers = [
      'InvoiceNo',
      'InvoiceDate',
      'BuyerNTN',
      'BuyerCNIC',
      'BuyerName',
      'ItemName',
      'Quantity',
      'UnitPrice',
      'SalesTaxRate'
    ];

    // Dummy data row to help the user understand the format
    const sampleData = [
      {
        InvoiceNo: 'INV-001',
        InvoiceDate: '2026-09-13',
        BuyerNTN: '1234567-8',
        BuyerCNIC: '',
        BuyerName: 'Acme Corp',
        ItemName: 'Service A',
        Quantity: 2,
        UnitPrice: 5000,
        SalesTaxRate: 18
      }
    ];

    // Create a new workbook and worksheet
    const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Invoices');

    // Generate buffer
    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Disposition': 'attachment; filename="fbr_bulk_invoice_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
