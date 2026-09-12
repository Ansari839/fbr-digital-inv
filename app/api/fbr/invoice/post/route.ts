import { NextResponse } from 'next/server';
import { fbrClient } from '@/lib/fbr/client';
import { checkDuplicateInvoice } from '@/lib/fbr/duplicate-check';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { businessUnitId, invoiceData, overrideDuplicate } = payload;

    // 1. Client-side Business Rule: Duplicate Check
    const dupCheck = await checkDuplicateInvoice(businessUnitId, invoiceData);
    
    if (dupCheck.isDuplicate && !overrideDuplicate) {
      return NextResponse.json({
        error: 'Duplicate detected',
        details: dupCheck
      }, { status: 409 }); // 409 Conflict
    }

    // 2. Call FBR API
    const fbrResponse = await fbrClient.postInvoice(invoiceData);

    // 3. Log Audit Response in DB
    await prisma.apiLog.create({
      data: {
        endpoint: 'postinvoicedata',
        requestBody: invoiceData,
        responseBody: fbrResponse as any,
        statusCode: 200,
      }
    });

    return NextResponse.json({ success: true, data: fbrResponse });
  } catch (error: any) {
    // Log failures as well
    console.error('Invoice Post Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
