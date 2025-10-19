import { NextResponse } from 'next/server';

// Returns array of { date, status, count }
export async function GET() {
  const today = new Date();
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const data = days.flatMap((date, i) => [
    { date, trade_status: 'Matched', count: 120 + i * 2 },
    { date, trade_status: 'Unmatched', count: 5 + (i % 3) },
  ]);

  return NextResponse.json(data);
}

