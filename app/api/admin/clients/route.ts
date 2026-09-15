import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = await prisma.businessUnit.findMany({
      where: {
        users: {
          none: {
            role: "SUPER_ADMIN"
          }
        }
      },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { invoices: true, users: true } }
      }
    });
    
    return Response.json(clients);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, planTier, maxStorageMb, maxInvoicesPerMonth, isActive, monthlyFee, paymentStatus } = body;

    const updated = await prisma.businessUnit.update({
      where: { id },
      data: {
        planTier,
        maxStorageMb: parseInt(maxStorageMb),
        maxInvoicesPerMonth: parseInt(maxInvoicesPerMonth),
        monthlyFee: parseInt(monthlyFee) || 0,
        paymentStatus: paymentStatus || "Paid",
        isActive
      }
    });

    return Response.json(updated);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, ntn, email, password, adminName, planTier, maxStorageMb, monthlyFee, paymentStatus } = body;

    if (!name || !ntn || !email || !password || !adminName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ error: "Email already in use" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const businessUnit = await prisma.businessUnit.create({
      data: {
        name,
        ntn,
        planTier: planTier || "Starter",
        monthlyFee: parseInt(monthlyFee) || 0,
        paymentStatus: paymentStatus || "Paid",
        maxStorageMb: parseInt(maxStorageMb || "500"),
        users: {
          create: {
            email,
            passwordHash,
            name: adminName,
            role: "TENANT",
          }
        }
      }
    });

    return Response.json(businessUnit);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Since we don't have cascade delete on Prisma schema for BusinessUnit relations,
    // we must manually delete related records in a transaction
    await prisma.$transaction([
      prisma.passwordResetRequest.deleteMany({ where: { user: { businessUnitId: id } } }),
      prisma.apiLog.deleteMany({ where: { invoice: { businessUnitId: id } } }),
      prisma.invoiceLineItem.deleteMany({ where: { invoice: { businessUnitId: id } } }),
      prisma.stockTransaction.deleteMany({ where: { item: { businessUnitId: id } } }),
      prisma.taxReturnPeriod.deleteMany({ where: { businessUnitId: id } }),
      prisma.user.deleteMany({ where: { businessUnitId: id } }),
      prisma.invoice.deleteMany({ where: { businessUnitId: id } }),
      prisma.item.deleteMany({ where: { businessUnitId: id } }),
      prisma.partyAddress.deleteMany({ where: { businessUnitId: id } }),
      prisma.businessUnit.delete({ where: { id } })
    ]);

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
