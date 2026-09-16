import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const data = await prisma.hsCode.findMany({
      where: {
        OR: [
          { businessUnitId: null }
        ]
      },
      orderBy: { code: 'asc' }
    });
    console.log("Success:", data);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
