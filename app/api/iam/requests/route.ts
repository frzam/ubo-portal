import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  const rows = [
    { requestId: 'REQ-10021', user: 'analyst_5', roleRequested: 'asset_user', submittedAt: '2025-10-18T11:21:00Z', status: 'Pending' },
    { requestId: 'REQ-10022', user: 'ops_1', roleRequested: 'asset_manager', submittedAt: '2025-10-19T08:03:00Z', status: 'Review' },
  ];
  return NextResponse.json(rows);
}


