import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    trades_today: 156,
    nav_completed: 48,
    recon_breaks: 8,
    compliance_alerts: 4,
    automation_ratio: 84,
  });
}

