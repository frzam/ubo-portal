import { NextResponse } from 'next/server';

// Mark as static; can also tune TTL via revalidate if needed
export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    trades_today: 172,
    nav_completed: 51,
    recon_breaks: 4,
    compliance_alerts: 5,
    automation_ratio: 86,
  });
}
