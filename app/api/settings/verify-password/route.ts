import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { password } = await req.json();
    
    if (!password) {
      return new Response("Password is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.passwordHash) {
      return new Response("User not found", { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
      return Response.json({ success: true });
    } else {
      return Response.json({ success: false, error: "Incorrect password" }, { status: 403 });
    }
  } catch (error: any) {
    return new Response(error.message || "Internal server error", { status: 500 });
  }
}
