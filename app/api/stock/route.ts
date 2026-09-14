import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: { itemType: 'Physical' },
      include: {
        stockTransactions: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stock data', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.itemId || !data.quantity) {
      return NextResponse.json({ error: 'Item ID and Quantity are required' }, { status: 400 });
    }

    const quantity = parseFloat(data.quantity);
    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 });
    }

    // Wrap in transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create stock transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          itemId: data.itemId,
          type: 'IN',
          quantity: quantity,
          reference: data.reference || null,
          notes: data.notes || null,
        }
      });

      // 2. Increment item stockQty
      await tx.item.update({
        where: { id: data.itemId },
        data: {
          stockQty: { increment: quantity }
        }
      });

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding stock:", error);
    return NextResponse.json({ error: 'Failed to add stock', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
