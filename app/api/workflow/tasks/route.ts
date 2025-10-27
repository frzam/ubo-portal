import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock richer workflow tasks dataset
export async function GET() {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 19);
  const daysFromNow = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  const tasks = [
    // Pending (not overdue)
    {
      task_id: 'NAV_20251018_0012',
      task_name: 'Approve NAV for Fund ALJ Growth',
      process_type: 'Fund Accounting',
      task_type: 'Approval',
      fund: 'ALJ Growth Fund',
      assigned_to: 'asset_manager_1',
      priority: 'High',
      status: 'Pending',
      created_on: iso(new Date(now.getTime() - 2 * 3600 * 1000)),
      due_date: daysFromNow(1),
      sla_remaining: '1d 2h',
      last_updated_by: 'system',
      actions: ['view', 'approve', 'reject', 'reassign'],
      source_system: 'NAV Engine',
    },
    // Overdue (not Pending)
    {
      task_id: 'REC_20251018_0021',
      task_name: 'Break allocation - Cash mismatch',
      process_type: 'Reconciliation',
      task_type: 'Exception',
      fund: 'Beta Fund',
      assigned_to: 'asset_user_1',
      priority: 'High',
      status: 'In Progress',
      created_on: iso(new Date(now.getTime() - 26 * 3600 * 1000)),
      due_date: daysFromNow(-1),
      sla_remaining: '-3h 45m',
      last_updated_by: 'system',
      actions: ['view', 'reassign', 'escalate'],
      source_system: 'Reconciliation Engine',
    },
    // Completed today
    {
      task_id: 'CA_20251019_0033',
      task_name: 'Entitlement recording - Dividend ABC Corp',
      process_type: 'Corporate Action',
      task_type: 'Review',
      fund: 'Delta Fund',
      assigned_to: 'asset_user_1',
      priority: 'Medium',
      status: 'Completed',
      created_on: iso(new Date(now.getTime() - 1 * 3600 * 1000)),
      due_date: daysFromNow(1),
      sla_remaining: '0h 00m',
      last_updated_by: 'asset_user_1',
      actions: ['view'],
      source_system: 'CA Processor',
    },
  ];
  return NextResponse.json(tasks);
}


