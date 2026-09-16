import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, businessUnitId: true } });
  const items = await prisma.item.findMany({ select: { name: true, businessUnitId: true } });
  console.log("Users:", users);
  console.log("Items:", items.map(i => `${i.name} -> ${i.businessUnitId}`));
}
main().catch(console.error);
