import { NextResponse } from 'next/server';

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
      due_date: daysFromNow(0),
      sla_remaining: '2h 10m',
      last_updated_by: 'system',
      actions: ['view', 'approve', 'reject', 'reassign'],
      source_system: 'NAV Engine',
    },
    {
      task_id: 'TRD_20251019_0088',
      task_name: 'Settlement confirmation - Trade 88421',
      process_type: 'Trade',
      task_type: 'Approval',
      fund: 'Alpha Fund',
      assigned_to: 'asset_user_1',
      priority: 'Medium',
      status: 'In Progress',
      created_on: iso(new Date(now.getTime() - 6 * 3600 * 1000)),
      due_date: daysFromNow(1),
      sla_remaining: '18h 00m',
      last_updated_by: 'asset_user_1',
      actions: ['view', 'approve', 'reject'],
      source_system: 'Trade Capture',
    },
    {
      task_id: 'REC_20251018_0021',
      task_name: 'Break allocation - Cash mismatch',
      process_type: 'Reconciliation',
      task_type: 'Exception',
      fund: 'Beta Fund',
      assigned_to: 'asset_user_1',
      priority: 'High',
      status: 'Pending',
      created_on: iso(new Date(now.getTime() - 26 * 3600 * 1000)),
      due_date: daysFromNow(-1),
      sla_remaining: '-3h 45m',
      last_updated_by: 'system',
      actions: ['view', 'reassign', 'escalate'],
      source_system: 'Reconciliation Engine',
    },
    {
      task_id: 'CMP_20251019_0005',
      task_name: 'Breach review - Concentration limit',
      process_type: 'Compliance',
      task_type: 'Approval',
      fund: 'Gamma Fund',
      assigned_to: 'asset_manager_1',
      priority: 'Low',
      status: 'Pending',
      created_on: iso(new Date(now.getTime() - 5 * 3600 * 1000)),
      due_date: daysFromNow(2),
      sla_remaining: '2d 1h',
      last_updated_by: 'compliance_bot',
      actions: ['view', 'approve', 'reject'],
      source_system: 'Compliance Checker',
    },
    {
      task_id: 'CA_20251019_0033',
      task_name: 'Entitlement recording - Dividend ABC Corp',
      process_type: 'Corporate Action',
      task_type: 'Review',
      fund: 'Delta Fund',
      assigned_to: 'asset_user_1',
      priority: 'Medium',
      status: 'Queued',
      created_on: iso(new Date(now.getTime() - 1 * 3600 * 1000)),
      due_date: daysFromNow(1),
      sla_remaining: '1d 3h',
      last_updated_by: 'system',
      actions: ['view'],
      source_system: 'CA Processor',
    },
  ];
  return NextResponse.json(tasks);
}

