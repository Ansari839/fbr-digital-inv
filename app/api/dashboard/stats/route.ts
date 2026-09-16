import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scopedDb } from "@/lib/db/tenant-scope";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.businessUnitId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = scopedDb(session.user.businessUnitId);

    // Fetch all invoices for this tenant
    // Later we can filter by date if provided in query params
    const invoices = await db.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lineItems: {
          include: {
            item: true
          }
        },
        party: true
      }
    }) as any[]; // Type assertion to bypass scopedDb loose typing

    // 1. Calculate Card Statistics
    let totalAmount = 0;
    let totalExclST = 0;
    let totalGST = 0;

    let successfulEntries = 0;
    let failedEntries = 0;
    let successfulTotalAmt = 0;
    let successfulTotalExclST = 0;
    let failedTotalAmt = 0;
    let failedTotalExclST = 0;

    const monthlyStats: Record<string, { name: string, Total: number, Success: number, Failed: number }> = {};

    for (const inv of invoices) {
      const isFailed = inv.status === 'Failed';
      const isSuccess = inv.status === 'Submitted' || inv.status === 'Success';
      
      const invTotal = inv.totalAmount ? Number(inv.totalAmount.toString()) : 0;
      
      // We calculate GST from line items
      let invGST = 0;
      let invExcl = 0;
      if (inv.lineItems && inv.lineItems.length > 0) {
        for (const item of inv.lineItems) {
          const itemVal = Number(item.quantity) * Number(item.rate);
          const taxRate = item.item?.taxRate ? Number(item.item.taxRate) : 18;
          const taxVal = (itemVal * taxRate) / 100;
          invGST += taxVal;
          invExcl += itemVal;
        }
      } else {
        // Fallback if no line items populated (legacy mock data)
        invExcl = invTotal / 1.18; // assuming 18% standard if no items
        invGST = invTotal - invExcl;
      }

      totalAmount += invTotal;
      totalExclST += invExcl;
      totalGST += invGST;

      if (isSuccess) {
        successfulEntries++;
        successfulTotalAmt += invTotal;
        successfulTotalExclST += invExcl;
      }
      if (isFailed) {
        failedEntries++;
        failedTotalAmt += invTotal;
        failedTotalExclST += invExcl;
      }

      // Group for chart (by Month YYYY-MM)
      const monthKey = new Date(inv.createdAt).toISOString().substring(0, 7);
      const monthName = new Date(inv.createdAt).toLocaleString('default', { month: 'short' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { name: monthName, Total: 0, Success: 0, Failed: 0 };
      }
      monthlyStats[monthKey].Total += 1;
      if (isSuccess) monthlyStats[monthKey].Success += 1;
      if (isFailed) monthlyStats[monthKey].Failed += 1;
    }

    const chartData = Object.keys(monthlyStats).sort().map(k => monthlyStats[k]);
    if (chartData.length === 0) {
      // Dummy month if no data
      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      chartData.push({ name: currentMonth, Total: 0, Success: 0, Failed: 0 });
    }

    const recentInvoices = invoices.slice(0, 100).map(inv => {
      let qty = 0;
      let gst = 0;
      let uom = 'PCS';
      if (inv.lineItems && inv.lineItems.length > 0) {
        uom = inv.lineItems[0].item?.uom || inv.lineItems[0].uom || 'PCS';
        for (const item of inv.lineItems) {
          const q = Number(item.quantity);
          const r = Number(item.rate);
          const tr = item.item?.taxRate ? Number(item.item.taxRate) : 18;
          qty += q;
          gst += (q * r * tr) / 100;
        }
      }
      const invTotal = inv.totalAmount ? Number(inv.totalAmount.toString()) : 0;
      
      const startTime = inv.fbrTimestamp || inv.createdAt;
      const hoursDiff = (new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
      const remainingHours = Math.max(0, 72 - hoursDiff);

      return {
        id: inv.id,
        date: new Date(startTime).toISOString().split('T')[0],
        fbrInvNum: inv.fbrIrn || 'N/A',
        buyerName: inv.party?.name || 'Unknown Buyer',
        qty: qty,
        uom: uom,
        value: invTotal - gst,
        gst: gst,
        total: invTotal,
        status: inv.status,
        remainingHours: Number(remainingHours.toFixed(1))
      };
    });

    return NextResponse.json({
      cards: {
        total: {
          count: invoices.length,
          amount: totalAmount,
          exclST: totalExclST
        },
        success: {
          count: successfulEntries,
          amount: successfulTotalAmt,
          exclST: successfulTotalExclST
        },
        failed: {
          count: failedEntries,
          amount: failedTotalAmt,
          exclST: failedTotalExclST
        },
        taxes: {
          salesTax: totalGST,
          furtherTax: 0, // Not tracked separately right now
          extraTax: 0
        }
      },
      chartData,
      recentInvoices
    });

  } catch (error: any) {
    console.error("Dashboard Stats API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
