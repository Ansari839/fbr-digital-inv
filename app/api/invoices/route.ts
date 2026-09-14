import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        party: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payload, buyerNTNCNIC, buyerBusinessName, buyerProvince, buyerAddress, forceIssueReason, items } = body;

    // 1. Get or Default Business Unit
    let bu = await prisma.businessUnit.findFirst();
    if (!bu) {
      bu = await prisma.businessUnit.create({
        data: { ntn: "7654321", name: "My Company Pvt Ltd" }
      });
    }

    // 2. Find or Create Party (Buyer)
    let party = await prisma.party.findFirst({
      where: {
        OR: [
          { ntnOrCnic: buyerNTNCNIC || "UNKNOWN" },
          { name: buyerBusinessName }
        ]
      },
      include: { addresses: true }
    });

    if (!party) {
      party = await prisma.party.create({
        data: {
          ntnOrCnic: buyerNTNCNIC || "0000000",
          name: buyerBusinessName || "Unknown Buyer",
          isRegistered: !!buyerNTNCNIC,
          addresses: {
            create: {
              label: "Default",
              province: buyerProvince || "Unknown",
              addressLine: buyerAddress || "Unknown"
            }
          }
        },
        include: { addresses: true }
      });
    } else if (party.addresses.length === 0) {
      const addr = await prisma.partyAddress.create({
        data: {
          partyId: party.id,
          label: "Default",
          province: buyerProvince || "Unknown",
          addressLine: buyerAddress || "Unknown"
        }
      });
      party.addresses = [addr];
    }

    // 3. Calculate Total Amount
    const totalAmount = items.reduce((acc: number, item: any) => {
      const valueExcl = item.quantity * item.rate;
      const tax = (valueExcl * parseFloat(item.taxRate || 0)) / 100;
      return acc + valueExcl + tax;
    }, 0);

    // 4. Mock FBR Payload Simulation
    const mockFbrIrn = `4220108920${Math.floor(Math.random() * 100000000)}`;
    const mockFbrTimestamp = new Date();

    // 5. Create Invoice in DB
    const newInvoice = await prisma.invoice.create({
      data: {
        businessUnitId: bu.id,
        partyId: party.id,
        partyAddressId: party.addresses[0].id,
        environment: "Sandbox (Demo)",
        fbrIrn: mockFbrIrn,
        fbrTimestamp: mockFbrTimestamp,
        status: "Submitted",
        totalAmount,
        forceIssueReason: forceIssueReason || null,
        lineItems: {
          create: items.map((i: any) => ({
            itemId: i.id || i.itemId,
            quantity: i.quantity,
            rate: i.rate,
            hsCode: i.hsCode
          }))
        }
      }
    });

    // 6. Deduct Stock
    for (const i of items) {
       await prisma.item.update({
         where: { id: i.id || i.itemId },
         data: {
           stockQty: { decrement: i.quantity }
         }
       }).catch(() => {}); // Ignore if stock item doesn't exist
    }

    return NextResponse.json({ success: true, invoice: newInvoice });

  } catch (error: any) {
    console.error('Invoice Save Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

