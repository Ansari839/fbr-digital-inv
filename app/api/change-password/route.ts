import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { password } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash,
        forcePasswordChange: false, // Turn off the flag!
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
