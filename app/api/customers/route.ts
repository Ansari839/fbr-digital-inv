import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).businessUnitId) {
      console.error("Customers GET Unauthorized. Session:", session);
      return NextResponse.json({ error: "Unauthorized", session: session || null }, { status: 401 });
    }

    const customers = await prisma.party.findMany({
      where: { businessUnitId: (session.user as any).businessUnitId },
      orderBy: { name: 'asc' },
      include: { addresses: true }
    });
    console.log("Found customers in DB:", customers);
    return NextResponse.json(customers || []);
  } catch (error) {
    console.error("Customers GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch customers', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).businessUnitId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.ntnOrCnic) {
      return NextResponse.json({ error: 'Name and NTN/CNIC are required' }, { status: 400 });
    }

    const customer = await prisma.party.create({
      data: {
        businessUnitId: (session.user as any).businessUnitId,
        name: data.name,
        ntnOrCnic: data.ntnOrCnic,
        isRegistered: data.isRegistered ?? false,
        addresses: {
          create: {
            label: "Default",
            addressLine: data.address || "",
            province: data.province || "",
          }
        }
      },
      include: { addresses: true }
    });
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
