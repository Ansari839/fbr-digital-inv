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
    const { id, planTier, maxStorageMb, maxInvoicesPerMonth, isActive } = body;

    const updated = await prisma.businessUnit.update({
      where: { id },
      data: {
        planTier,
        maxStorageMb: parseInt(maxStorageMb),
        maxInvoicesPerMonth: parseInt(maxInvoicesPerMonth),
        isActive
      }
    });

    return Response.json(updated);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
