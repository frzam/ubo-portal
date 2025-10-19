import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date();
  const series = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      FundA_NAV: 100 + i * 0.8 + (i % 2 ? 0.5 : -0.3),
      FundB_NAV: 98 + i * 0.6 + (i % 3 ? 0.7 : -0.2),
      FundC_NAV: 102 + i * 0.5 + (i % 2 ? 0.4 : -0.4),
    };
  });
  return NextResponse.json(series);
}

