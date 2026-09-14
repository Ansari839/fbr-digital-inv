import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  const wsData = [
    ['Name', 'Internal Variant (Optional)', 'HSCode', 'UOM', 'UnitPrice', 'TaxRate', 'SaleType', 'ItemType'],
    ['Dell Laptop', 'Latitude 5490', '8471.3010', 'PCS', '150000', '18', 'Goods at standard rate (default)', 'Physical'],
    ['Consultation Fee', '', '9999.9999', 'PCS', '5000', '18', 'Services (FED in ST Mode)', 'Service'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  ws['!cols'] = [
    { wch: 25 }, // Name
    { wch: 25 }, // Internal Variant
    { wch: 15 }, // HSCode
    { wch: 10 }, // UOM
    { wch: 15 }, // UnitPrice
    { wch: 10 }, // TaxRate
    { wch: 35 }, // SaleType
    { wch: 15 }, // ItemType
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Items');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="Items_Bulk_Template.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
