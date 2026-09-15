import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let smtp = await prisma.smtpConfig.findUnique({
      where: { id: "default-smtp" }
    });

    return Response.json(smtp || {});
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
    const { host, port, secure, user, pass, fromEmail, fromName } = body;

    const updated = await prisma.smtpConfig.upsert({
      where: { id: "default-smtp" },
      update: {
        host,
        port: parseInt(port),
        secure: Boolean(secure),
        user,
        pass,
        fromEmail,
        fromName
      },
      create: {
        id: "default-smtp",
        host,
        port: parseInt(port),
        secure: Boolean(secure),
        user,
        pass,
        fromEmail,
        fromName
      }
    });

    return Response.json(updated);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
