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

    const business = await prisma.businessUnit.findUnique({
      where: { id: (session.user as any).businessUnitId }
    });
    
    if (!business) {
       return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }
    
    return NextResponse.json(business);
  } catch (error) {
    console.error('Failed to fetch business profile:', error);
    return NextResponse.json({ error: 'Failed to fetch business profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).businessUnitId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, ntn, strn, logoUrl, themeColor, province, address } = data;
    
    const updated = await prisma.businessUnit.update({
      where: { id: (session.user as any).businessUnitId },
      data: {
        name,
        ntn,
        strn,
        logoUrl,
        themeColor,
        province,
        address
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update business profile:', error);
    return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 });
  }
}
