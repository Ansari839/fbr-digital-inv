import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const buId = (session?.user as any)?.businessUnitId;
    
    const data = await prisma.uom.findMany({ 
      where: {
        businessUnitId: buId
      },
      orderBy: { code: 'asc' } 
    });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("UOM GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const buId = (session?.user as any)?.businessUnitId || null;

    const body = await req.json();
    const uom = await prisma.uom.create({
      data: { 
        code: body.code, 
        description: body.description || '',
        businessUnitId: buId
      }
    });
    return NextResponse.json(uom);
  } catch (error: any) {
    console.error("UOM POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
