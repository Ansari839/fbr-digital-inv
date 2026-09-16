import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).businessUnitId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.item.findMany({
      where: { businessUnitId: (session.user as any).businessUnitId },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).businessUnitId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.name || !data.hsCode || data.defaultRate === undefined || data.defaultRate === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const item = await prisma.item.create({
      data: {
        businessUnitId: (session.user as any).businessUnitId,
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
