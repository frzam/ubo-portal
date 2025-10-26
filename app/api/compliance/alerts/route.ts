import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { alertType: 'KYC Review', severity: 'High', fund: 'Alpha Fund', dueDate: '2025-10-20', status: 'Open' },
    { alertType: 'Limit Breach', severity: 'Medium', fund: 'Beta Fund', dueDate: '2025-10-21', status: 'Investigating' },
    { alertType: 'Trade Surveillance', severity: 'Low', fund: 'Gamma Fund', dueDate: '2025-10-23', status: 'Open' },
  ]);
}


