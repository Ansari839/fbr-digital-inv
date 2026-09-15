import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // In a real app, this would be scoped to the authenticated user's business unit.
    // For now, we fetch the first one (or create one if none exists)
    let business = await prisma.businessUnit.findFirst({
      orderBy: { id: 'asc' }
    });
    
    if (!business) {
      business = await prisma.businessUnit.create({
        data: {
          name: 'FBR SyncPro',
          ntn: '1234567-8',
        }
      });
    }
    
    return NextResponse.json(business);
  } catch (error) {
    console.error('Failed to fetch business profile:', error);
    return NextResponse.json({ error: 'Failed to fetch business profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, name, ntn, strn, logoUrl, themeColor } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Business Unit ID is required' }, { status: 400 });
    }

    const updated = await prisma.businessUnit.update({
      where: { id },
      data: {
        name,
        ntn,
        strn,
        logoUrl,
        themeColor
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update business profile:', error);
    return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 });
  }
}
