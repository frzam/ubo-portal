import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { ts: '2025-10-12T09:30:00Z', type: 'RM Meeting', note: 'Quarterly portfolio review' },
    { ts: '2025-10-15T14:10:00Z', type: 'Service Request', note: 'Address update' },
    { ts: '2025-10-18T11:00:00Z', type: 'Call', note: 'Discussed new fund subscription' },
  ]);
}


