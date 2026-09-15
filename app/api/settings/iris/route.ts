import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scopedDb } from "@/lib/db/tenant-scope";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.businessUnitId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const db = scopedDb(session.user.businessUnitId);
    const bu = await db.businessUnit.getCurrent();
    
    if (!bu) {
      return new Response("Business unit not found", { status: 404 });
    }

    return Response.json({
      irisEnvironment: bu.irisEnvironment,
      irisSandboxToken: bu.irisSandboxToken,
      irisProductionToken: bu.irisProductionToken,
    });
  } catch (error: any) {
    return new Response(error.message || "Internal server error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.businessUnitId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { irisEnvironment, irisSandboxToken, irisProductionToken } = await req.json();
    const db = scopedDb(session.user.businessUnitId);

    const updated = await db.businessUnit.update({
      data: {
        irisEnvironment,
        irisSandboxToken,
        irisProductionToken
      }
    });

    return Response.json({ success: true, irisEnvironment: updated.irisEnvironment });
  } catch (error: any) {
    return new Response(error.message || "Internal server error", { status: 500 });
  }
}
