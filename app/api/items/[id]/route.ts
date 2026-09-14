import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    await prisma.item.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    
    const item = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        internalName: data.internalName || null,
        hsCode: data.hsCode,
        uom: data.uom || 'PCS',
        defaultRate: data.defaultRate,
        itemType: data.itemType || 'Physical',
        taxRate: data.taxRate || 18,
        saleType: data.saleType || 'Goods at standard rate (default)',
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
