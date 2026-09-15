import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const clients = await prisma.businessUnit.findMany({
      select: {
        maxStorageMb: true,
        maxInvoicesPerMonth: true,
      }
    });

    const vps = await prisma.vpsConfig.findUnique({
      where: { id: "default-vps" }
    });

    const totalClients = clients.length;
    const totalAllocatedStorageMb = clients.reduce((acc, c) => acc + c.maxStorageMb, 0);
    const totalMonthlyInvoiceQuota = clients.reduce((acc, c) => acc + c.maxInvoicesPerMonth, 0);
    const vpsTotalStorageMb = vps?.storageMb || 0;

    console.log(JSON.stringify({
      totalClients,
      totalAllocatedStorageMb,
      totalMonthlyInvoiceQuota,
      vpsTotalStorageMb
    }));
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
