import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.apiLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        invoice: {
          select: {
            serialNumber: true,
            totalAmount: true,
            businessUnit: { select: { name: true } }
          }
        }
      }
    });

    return Response.json(logs);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
