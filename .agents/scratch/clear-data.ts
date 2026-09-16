import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data cleanup...');
  
  // Delete all business data (order matters due to foreign keys)
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.item.deleteMany();
  await prisma.partyAddress.deleteMany();
  await prisma.party.deleteMany();
  await prisma.apiLog.deleteMany();
  
  console.log('Successfully cleared all dummy Customers, Invoices, Items, and Logs!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
