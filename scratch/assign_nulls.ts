import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'demo1@gmail.com' } });
    if (!user || !user.businessUnitId) {
      console.log("No demo1 user found, exiting.");
      return;
    }
    const buId = user.businessUnitId;
    
    const hsRes = await prisma.hsCode.updateMany({
      where: { businessUnitId: null },
      data: { businessUnitId: buId }
    });
    
    const uomRes = await prisma.uom.updateMany({
      where: { businessUnitId: null },
      data: { businessUnitId: buId }
    });
    
    console.log(`Updated ${hsRes.count} HSCodes and ${uomRes.count} UOMs to Demo1 (ID: ${buId})`);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
