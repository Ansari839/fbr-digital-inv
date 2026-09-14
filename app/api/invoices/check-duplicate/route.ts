import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partyId, totalAmount, items } = body;

    if (!partyId || totalAmount === undefined || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find any invoice in the current month for this party with the EXACT same total amount
    const potentialDuplicates = await prisma.invoice.findMany({
      where: {
        partyId: partyId,
        totalAmount: totalAmount,
        createdAt: {
          gte: startOfMonth,
        }
      },
      include: {
        lineItems: true
      }
    });

    if (potentialDuplicates.length === 0) {
      return NextResponse.json({ isDuplicate: false });
    }

    // Further check if the items match exactly
    // A strict match means the exact same number of items, and each item has same quantity and rate
    let exactMatchFound = false;

    for (const inv of potentialDuplicates) {
      if (inv.lineItems.length !== items.length) continue;

      let allItemsMatch = true;
      for (let i = 0; i < items.length; i++) {
        const payloadItem = items[i];
        // We match by itemId, quantity, and rate
        const dbItem = inv.lineItems.find(li => 
          li.itemId === payloadItem.itemId && 
          Number(li.quantity) === Number(payloadItem.quantity) && 
          Number(li.rate) === Number(payloadItem.rate)
        );

        if (!dbItem) {
          allItemsMatch = false;
          break;
        }
      }

      if (allItemsMatch) {
        exactMatchFound = true;
        break;
      }
    }

    return NextResponse.json({ 
      isDuplicate: exactMatchFound,
      message: exactMatchFound ? "Exact match found in the current month." : ""
    });

  } catch (error) {
    console.error("Error checking duplicate:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
