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
      select: {
        id: true,
        name: true,
        planTier: true,
        maxStorageMb: true,
        maxInvoicesPerMonth: true,
        isActive: true,
        monthlyFee: true,
      }
    });

    const vps = await prisma.vpsConfig.findUnique({
      where: { id: "default-vps" }
    });

    let monthlyIncome = 0;
    clients.forEach(c => {
      if (c.isActive) {
        monthlyIncome += c.monthlyFee;
      }
    });

    const totalClients = clients.filter(c => c.isActive).length;
    const totalAllocatedStorageMb = clients.reduce((acc, c) => acc + c.maxStorageMb, 0);
    const totalMonthlyInvoiceQuota = clients.reduce((acc, c) => acc + c.maxInvoicesPerMonth, 0);
    const vpsTotalStorageMb = vps?.storageMb || 0;

    // Mock chart data (in real app, group by createdAt)
    const revenueData = [
      { name: "Jan", total: Math.floor(monthlyIncome * 0.4) },
      { name: "Feb", total: Math.floor(monthlyIncome * 0.5) },
      { name: "Mar", total: Math.floor(monthlyIncome * 0.6) },
      { name: "Apr", total: Math.floor(monthlyIncome * 0.8) },
      { name: "May", total: Math.floor(monthlyIncome * 0.9) },
      { name: "Jun", total: monthlyIncome },
    ];

    const recentClients = clients.slice(0, 5).map(c => ({
      id: c.id,
      name: c.name,
      planTier: c.planTier,
      amount: `Rs ${c.monthlyFee.toLocaleString()}`
    }));

    return Response.json({
      totalClients,
      totalAllocatedStorageMb,
      totalMonthlyInvoiceQuota,
      vpsTotalStorageMb,
      monthlyIncome,
      revenueData,
      recentClients
    });
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
