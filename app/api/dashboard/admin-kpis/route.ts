import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    trades_today: 172,
    nav_completed: 51,
    recon_breaks: 7,
    compliance_alerts: 5,
    automation_ratio: 86,
  });
}

