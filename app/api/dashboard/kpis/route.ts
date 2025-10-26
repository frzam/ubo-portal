import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  // Mocked KPI values for asset back office users
  return NextResponse.json({
    trades_today: 134,
    nav_computed: 42,
    recon_breaks: 4,
    compliance_alerts: 3,
  });
}
