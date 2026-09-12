import prisma from '../prisma';
import { InvoicePayload } from './types';
import { Decimal } from '@prisma/client/runtime/library';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType: 'none' | 'exact' | 'partial';
  message?: string;
  matchedInvoiceId?: string;
}

export async function checkDuplicateInvoice(
  businessUnitId: string,
  payload: InvoicePayload
): Promise<DuplicateCheckResult> {
  const buyerId = payload.buyerNTNCNIC;
  
  if (!buyerId) {
    return { isDuplicate: false, matchType: 'none' };
  }

  const payloadTotal = payload.items.reduce((sum, item) => sum + item.totalValues, 0);

  // Find invoices on the same date for the same buyer
  // In a real app we'd parse the date or compare exact strings depending on format
  const startOfDay = new Date(payload.invoiceDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  const endOfDay = new Date(payload.invoiceDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingInvoices = await prisma.invoice.findMany({
    where: {
      businessUnitId,
      party: {
        ntnOrCnic: buyerId,
      },
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
    include: {
      lineItems: true,
    }
  });

  if (existingInvoices.length === 0) {
    return { isDuplicate: false, matchType: 'none' };
  }

  for (const existing of existingInvoices) {
    // Exact match: same total amount
    const existingTotal = Number(existing.totalAmount.toString());
    
    if (Math.abs(existingTotal - payloadTotal) < 0.01) {
      // Check if line items match
      let allItemsMatch = true;
      if (existing.lineItems.length !== payload.items.length) {
        allItemsMatch = false;
      } else {
        // Simple comparison of HS codes and quantities
        for (let i = 0; i < payload.items.length; i++) {
          const pItem = payload.items[i];
          const found = existing.lineItems.some(
            (ei) => ei.hsCode === pItem.hsCode && Number(ei.quantity) === pItem.quantity
          );
          if (!found) allItemsMatch = false;
        }
      }

      if (allItemsMatch) {
        return {
          isDuplicate: true,
          matchType: 'exact',
          message: 'An exact duplicate of this invoice already exists for this buyer today.',
          matchedInvoiceId: existing.id
        };
      }
    }

    // Partial match: same day, same buyer, but different total or items
    return {
      isDuplicate: true,
      matchType: 'partial',
      message: 'An invoice for this buyer was already created today. Please ensure this is not a duplicate.',
      matchedInvoiceId: existing.id
    };
  }

  return { isDuplicate: false, matchType: 'none' };
}
