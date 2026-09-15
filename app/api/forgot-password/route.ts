import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Check if there is already a pending request to prevent spam
    const existingRequest = await prisma.passwordResetRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    });

    if (!existingRequest) {
      await prisma.passwordResetRequest.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create password reset request:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
