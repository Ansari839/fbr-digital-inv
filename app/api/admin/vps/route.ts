import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vpsConfig = await prisma.vpsConfig.findUnique({
      where: { id: "default-vps" }
    });
    
    return Response.json(vpsConfig || null);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { hostname, ipAddress, provider, vCpu, ram, storageMb, status, startDate, renewalDate } = body;

    const vpsConfig = await prisma.vpsConfig.upsert({
      where: { id: "default-vps" },
      update: {
        hostname, ipAddress, provider, vCpu, ram, storageMb: parseInt(storageMb), status, startDate, renewalDate
      },
      create: {
        id: "default-vps",
        hostname, ipAddress, provider, vCpu, ram, storageMb: parseInt(storageMb), status, startDate, renewalDate
      }
    });

    return Response.json(vpsConfig);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
