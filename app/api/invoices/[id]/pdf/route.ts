import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import prisma from '@/lib/prisma';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import { ReactElement } from 'react';
import { DocumentProps } from '@react-pdf/renderer';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lineItems: {
          include: { item: true },
        },
        party: true,
        partyAddress: true,
        businessUnit: true,
      },
    });

    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const element = React.createElement(InvoicePDF, { invoice }) as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(element);
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${id.slice(-6).toUpperCase()}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[PDF Error]', err);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
