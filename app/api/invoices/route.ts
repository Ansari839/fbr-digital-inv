import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scopedDb } from '@/lib/db/tenant-scope';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.businessUnitId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = scopedDb(session.user.businessUnitId);
    const invoices = await db.invoice.findMany({
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.businessUnitId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = scopedDb(session.user.businessUnitId);
    const body = await request.json();
    const { payload, buyerNTNCNIC, buyerBusinessName, buyerProvince, buyerAddress, forceIssueReason, items, applyWht } = body;

    // 1. Get Business Unit & Check Quota
    const bu = await db.businessUnit.getCurrent();
    if (!bu) return NextResponse.json({ error: 'Business unit not found' }, { status: 404 });

    if (bu.storageUsedMb >= bu.maxStorageMb) {
      return NextResponse.json({ error: 'Storage quota exceeded. Please upgrade your package.' }, { status: 403 });
    }
    
    // Also checking maxInvoicesPerMonth
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const invoiceCountThisMonth = await db.invoice.count({ where: { createdAt: { gte: startOfMonth } } });
    if (invoiceCountThisMonth >= bu.maxInvoicesPerMonth) {
      return NextResponse.json({ error: 'Monthly invoice limit exceeded. Please upgrade your package.' }, { status: 403 });
    }

    // Checking IRIS Configuration (Bypassed for Demo)
    // const activeToken = bu.irisEnvironment === "PRODUCTION" ? bu.irisProductionToken : bu.irisSandboxToken;
    // if (!activeToken) {
    //   return NextResponse.json({ error: `FBR IRIS ${bu.irisEnvironment} token is missing. Please configure it in Settings.` }, { status: 400 });
    // }

    // 2. Find or Create Party (Buyer)
    let party = await prisma.party.findFirst({
      where: {
        OR: [
          { ntnOrCnic: buyerNTNCNIC || "UNKNOWN" },
          { name: buyerBusinessName }
        ],
        invoices: { some: { businessUnitId: bu.id } } // Ensure party belongs to this tenant
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
              addressLine: buyerAddress || "Unknown",
              businessUnitId: bu.id
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
          addressLine: buyerAddress || "Unknown",
          businessUnitId: bu.id
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

    // 5. Create Invoice in DB using scopedDb
    const newInvoice = await db.invoice.create({
      data: {
        partyId: party.id,
        partyAddressId: party.addresses[0].id,
        environment: bu.irisEnvironment === "PRODUCTION" ? "Production" : "Sandbox (Demo)",
        fbrIrn: mockFbrIrn,
        fbrTimestamp: mockFbrTimestamp,
        status: "Submitted",
        totalAmount,
        applyWht: applyWht !== undefined ? applyWht : true,
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
       await db.item.update({
         where: { id: i.id || i.itemId },
         data: {
           stockQty: { decrement: i.quantity }
         }
       }).catch(() => {}); // Ignore if stock item doesn't exist
    }

    // 7. Increment Storage Quota (simulate PDF size ~ 0.2 MB per invoice)
    await db.businessUnit.updateStorage(0.2);

    return NextResponse.json({ success: true, invoice: newInvoice });

  } catch (error: any) {
    console.error('Invoice Save Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

