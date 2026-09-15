import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.passwordResetRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requestId, userId } = await req.json();

    if (!requestId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a secure temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Update user password and set forcePasswordChange to true
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        forcePasswordChange: true,
      }
    });

    // Mark request as completed
    const updatedRequest = await prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({ success: true, temporaryPassword, request: updatedRequest });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
