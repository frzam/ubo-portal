import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    trades_today: 156,
    nav_completed: 48,
    recon_breaks: 4,
    compliance_alerts: 4,
    automation_ratio: 84,
  });
}
