import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { date: '2025-10-10', eventType: 'KYC Review Due', description: 'Periodic KYC review pending', severity: 'Medium', actionTaken: 'Reminder sent' },
    { date: '2025-10-14', eventType: 'Large Outflow', description: 'Outflow exceeding threshold', severity: 'High', actionTaken: 'Reviewed' },
  ]);
}


