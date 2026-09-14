import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  const wsData = [
    ['Name', 'NTN_CNIC', 'Province', 'Address', 'IsRegistered'],
    ['Acme Corp', '1234567-8', 'Sindh', 'Main Street, Karachi', 'Yes'],
    ['Local Shop', '0000000000000', 'Punjab', 'Ghalib Market, Lahore', 'No'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  ws['!cols'] = [
    { wch: 25 }, // Name
    { wch: 20 }, // NTN_CNIC
    { wch: 15 }, // Province
    { wch: 30 }, // Address
    { wch: 15 }, // IsRegistered
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(excelBuffer, {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="Customers_Bulk_Template.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
