import { NextResponse } from 'next/server';
import { fbrClient } from '@/lib/fbr/client';

export async function POST(request: Request) {
  try {
    const { ntnOrCnic } = await request.json();

    if (!ntnOrCnic) {
      return NextResponse.json({ error: 'ntnOrCnic is required' }, { status: 400 });
    }

    // In a real app, this would use the fbrClient to call the exact STATL/EVIV API
    // The STATL reference API uses the same security token.
    // e.g.: const status = await fbrClient.request('dist/v1/statl', { regno: ntnOrCnic, date: new Date().toISOString() });
    
    // For demonstration/sandbox: we simulate the response
    const isActive = true; 

    return NextResponse.json({
      status: isActive ? 'Active' : 'In-Active',
      registrationNo: ntnOrCnic,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
