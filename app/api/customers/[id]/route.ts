import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Delete addresses first to avoid foreign key constraint error
    await prisma.partyAddress.deleteMany({
      where: { partyId: id }
    });

    await prisma.party.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    
    // Update party
    const customer = await prisma.party.update({
      where: { id },
      data: {
        name: data.name,
        ntnOrCnic: data.ntnOrCnic,
        isRegistered: data.isRegistered ?? false,
      }
    });

    // Update first address
    const addresses = await prisma.partyAddress.findMany({ where: { partyId: id } });
    if (addresses.length > 0) {
      await prisma.partyAddress.update({
        where: { id: addresses[0].id },
        data: {
          addressLine: data.address || "",
          province: data.province || "",
        }
      });
    } else {
      await prisma.partyAddress.create({
        data: {
          partyId: id,
          label: "Default",
          addressLine: data.address || "",
          province: data.province || "",
        }
      });
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
