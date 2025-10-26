import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  const rows = [
    { auditPoint: 'NAV review evidence missing', severity: 'High', assignedTo: 'analyst_2', targetDate: '2025-11-02', status: 'Open' },
    { auditPoint: 'Trade approval workflow gap', severity: 'Medium', assignedTo: 'asset_manager_1', targetDate: '2025-11-10', status: 'In Progress' },
    { auditPoint: 'KYC periodic refresh overdue', severity: 'High', assignedTo: 'compliance_1', targetDate: '2025-10-28', status: 'Open' },
  ];
  return NextResponse.json(rows);
}


