import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(ws);
    
    let imported = 0;
    let bu = await prisma.businessUnit.findFirst();
    if (!bu) {
        bu = await prisma.businessUnit.create({ data: { ntn: '1234567', name: 'Default Business' } });
    }

    for (const row of data) {
      if (!row.Name || !row.HSCode) continue;
      
      await prisma.item.create({
        data: {
          businessUnitId: bu.id,
          name: String(row.Name),
          internalName: row['Internal Variant (Optional)'] ? String(row['Internal Variant (Optional)']) : null,
          hsCode: String(row.HSCode),
          uom: String(row.UOM || 'PCS'),
          defaultRate: parseFloat(String(row.UnitPrice || '0')),
          taxRate: parseFloat(String(row.TaxRate || '18')),
          saleType: String(row.SaleType || 'Goods at standard rate (default)'),
          itemType: String(row.ItemType || 'Physical')
        }
      });
      imported++;
    }
    return NextResponse.json({ success: true, imported });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
