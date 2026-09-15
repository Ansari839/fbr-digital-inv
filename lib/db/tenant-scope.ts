import prisma from "@/lib/prisma";

export function scopedDb(businessUnitId: string) {
  return {
    invoice: {
      findMany: (args: any = {}) =>
        prisma.invoice.findMany({ ...args, where: { ...args.where, businessUnitId } }),
      findFirst: (args: any = {}) =>
        prisma.invoice.findFirst({ ...args, where: { ...args.where, businessUnitId } }),
      findUnique: (id: string) =>
        prisma.invoice.findFirst({ where: { id, businessUnitId } }),
      create: (args: any) =>
        prisma.invoice.create({ ...args, data: { ...args.data, businessUnitId } }),
      update: (args: any) =>
        prisma.invoice.update({ ...args, where: { id: args.where.id } }),
      count: (args: any = {}) =>
        prisma.invoice.count({ ...args, where: { ...args.where, businessUnitId } }),
    },
    party: {
      findMany: (args: any = {}) =>
        prisma.party.findMany({
          ...args,
          where: {
            ...args.where,
            invoices: { some: { businessUnitId } },
          },
        }),
    },
    item: {
      findMany: (args: any = {}) =>
        prisma.item.findMany({ ...args, where: { ...args.where, businessUnitId } }),
      findFirst: (args: any = {}) =>
        prisma.item.findFirst({ ...args, where: { ...args.where, businessUnitId } }),
      findUnique: (id: string) =>
        prisma.item.findFirst({ where: { id, businessUnitId } }),
      create: (args: any) =>
        prisma.item.create({ ...args, data: { ...args.data, businessUnitId } }),
      update: (args: any) =>
        prisma.item.update({ ...args }),
    },
    businessUnit: {
      getCurrent: () => prisma.businessUnit.findUnique({ where: { id: businessUnitId } }),
      update: (args: any) => prisma.businessUnit.update({ ...args, where: { id: businessUnitId } }),
      updateStorage: async (incrementMb: number) => {
        return prisma.businessUnit.update({
          where: { id: businessUnitId },
          data: { storageUsedMb: { increment: incrementMb } },
        });
      },
    },
  };
}
