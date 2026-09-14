import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.party.findMany({
      orderBy: { name: 'asc' },
      include: { addresses: true }
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.ntnOrCnic) {
      return NextResponse.json({ error: 'Name and NTN/CNIC are required' }, { status: 400 });
    }

    const customer = await prisma.party.create({
      data: {
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
