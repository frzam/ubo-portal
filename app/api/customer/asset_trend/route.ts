import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const today = new Date();
  const rows = [...Array(12)].map((_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - (11 - i));
    return { date: d.toISOString().slice(0, 10), asset_value: 800000 + i * 25000 + (i % 2 ? 4000 : -3000) };
  });
  return NextResponse.json(rows);
}

