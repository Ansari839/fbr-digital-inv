import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Check if Super Admin BU exists
  let adminBu = await prisma.businessUnit.findFirst({
    where: { name: "System Administration" }
  });

  if (!adminBu) {
    adminBu = await prisma.businessUnit.create({
      data: {
        name: "System Administration",
        ntn: "1234567-8",
        planTier: "Enterprise",
        maxStorageMb: 10000,
      }
    });
    console.log("Created Super Admin Business Unit");
  }

  // 2. Check if Super Admin User exists
  let adminUser = await prisma.user.findUnique({
    where: { email: "superadmin@syncpro.pk" }
  });

  if (!adminUser) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    adminUser = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "superadmin@syncpro.pk",
        passwordHash,
        role: "SUPER_ADMIN",
        businessUnitId: adminBu.id,
      }
    });
    console.log("Created Super Admin User: superadmin@syncpro.pk / admin123");
  } else {
    console.log("Super Admin already exists: superadmin@syncpro.pk");
  }

  // 3. Create a Demo Tenant for testing
  let demoBu = await prisma.businessUnit.findFirst({
    where: { name: "Demo Tenant" }
  });

  if (!demoBu) {
    demoBu = await prisma.businessUnit.create({
      data: {
        name: "Demo Tenant",
        ntn: "8765432-1",
        planTier: "Starter",
        maxStorageMb: 500,
      }
    });
    console.log("Created Demo Tenant Business Unit");
  }

  let demoUser = await prisma.user.findUnique({
    where: { email: "demo@syncpro.pk" }
  });

  if (!demoUser) {
    const passwordHash = await bcrypt.hash("demo123", 10);
    demoUser = await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@syncpro.pk",
        passwordHash,
        role: "TENANT",
        businessUnitId: demoBu.id,
      }
    });
    console.log("Created Demo Tenant User: demo@syncpro.pk / demo123");
  } else {
    console.log("Demo User already exists: demo@syncpro.pk");
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
