import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).businessUnitId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const wb = XLSX.read(buffer, { type: 'buffer' });
    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];

    const data: any[] = XLSX.utils.sheet_to_json(ws);
    
    let imported = 0;

    for (const row of data) {
      if (!row.Name || !row.NTN_CNIC) continue; // Skip empty/invalid rows
      
      const isReg = String(row.IsRegistered).toLowerCase().trim() === 'yes' || String(row.IsRegistered).toLowerCase().trim() === 'true';

      await prisma.party.create({
        data: {
          businessUnitId: (session.user as any).businessUnitId,
          name: String(row.Name),
          ntnOrCnic: String(row.NTN_CNIC),
          isRegistered: isReg,
          addresses: {
            create: {
              label: "Default",
              addressLine: row.Address ? String(row.Address) : "",
              province: row.Province ? String(row.Province) : "",
            }
          }
        }
      });
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process bulk upload' }, { status: 500 });
  }
}
