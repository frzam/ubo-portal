import { NextResponse } from 'next/server';

export async function GET() {
  const rows = [
    { userId: 'asset_user_2', activity: 'Unusual after-hours access', detectedAt: '2025-10-19T02:14:00Z', riskScore: 78, actionTaken: 'Notified' },
    { userId: 'analyst_1', activity: 'Multiple failed login attempts', detectedAt: '2025-10-19T09:12:00Z', riskScore: 64, actionTaken: 'Locked' },
  ];
  return NextResponse.json(rows);
}

