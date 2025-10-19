import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    active_users: 32,
    privileged_accounts: 6,
    failed_logins: 12,
    open_vulns: 25,
    compliance_score: 89,
  });
}

