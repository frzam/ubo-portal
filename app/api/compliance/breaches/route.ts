import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { id: 'BR-001', rule_id: 'LIM-1', fund: 'Alpha Fund', details: 'Issuer ABC at 11.2% (>10%)', status: 'Open', detected_at: '2025-10-19T09:10:00' },
    { id: 'BR-002', rule_id: 'LIM-2', fund: 'Beta Fund', details: 'Country exposure 27% (>25%)', status: 'Under Review', detected_at: '2025-10-18T14:44:00' }
  ]);
}


