import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scopedDb } from "@/lib/db/tenant-scope";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.businessUnitId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = scopedDb(session.user.businessUnitId);
    const businessUnit = await db.businessUnit.getCurrent();
    
    if (!businessUnit) {
      return Response.json({ error: "Business unit not found" }, { status: 404 });
    }

    // You can also add maxInvoicesPerMonth logic here if needed
    
    return Response.json({
      maxStorageMb: businessUnit.maxStorageMb,
      storageUsedMb: businessUnit.storageUsedMb,
      planTier: businessUnit.planTier,
    });
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
