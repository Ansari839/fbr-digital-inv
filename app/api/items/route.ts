import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.name || !data.hsCode || data.defaultRate === undefined || data.defaultRate === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Default business unit logic (since there's no auth yet)
    // Find or create a default business unit
    let bu = await prisma.businessUnit.findFirst();
    if (!bu) {
        bu = await prisma.businessUnit.create({
            data: {
                ntn: '1234567',
                name: 'Default Business',
            }
        });
    }

    const item = await prisma.item.create({
      data: {
        businessUnitId: bu.id,
        name: data.name,
        internalName: data.internalName || null,
        hsCode: data.hsCode,
        uom: data.uom || 'PCS',
        defaultRate: data.defaultRate,
        stockQty: data.stockQty || 0,
        itemType: data.itemType || 'Physical',
        taxRate: data.taxRate || 18,
        saleType: data.saleType || 'Goods at standard rate (default)',
      }
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: 'Failed to create item', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
