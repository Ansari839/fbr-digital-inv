import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const data = await prisma.hsCode.findMany({ orderBy: { code: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const hscode = await prisma.hsCode.create({
    data: { code: body.code, description: body.description || '' }
  });
  return NextResponse.json(hscode);
}
