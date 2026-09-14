import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { quantity } = await req.json();
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
    }

    // Use Prisma's increment atomic operation to safely update stock
    const item = await prisma.item.update({
      where: { id },
      data: {
        stockQty: { increment: quantity }
      }
    });
    
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
