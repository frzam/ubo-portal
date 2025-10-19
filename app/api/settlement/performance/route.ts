import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date();
  const days = [...Array(14)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    return { date: d.toISOString().slice(0, 10), success_rate: 92 + Math.round(Math.sin(i / 2) * 5) };
  });
  return NextResponse.json(days);
}

