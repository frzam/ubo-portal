import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { task: 'Approve Corporate Action', owner: 'asset_user_1', priority: 'High', dueDate: '2025-10-21', status: 'Pending' },
    { task: 'Reconcile Cash Breaks', owner: 'asset_user_1', priority: 'Medium', dueDate: '2025-10-22', status: 'In Progress' },
    { task: 'NAV Validation', owner: 'asset_user_1', priority: 'Low', dueDate: '2025-10-23', status: 'Queued' },
  ]);
}


