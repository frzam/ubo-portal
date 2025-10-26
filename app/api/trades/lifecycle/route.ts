import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  const today = new Date();
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const date = d.toISOString().slice(0, 10);
    const matched = 110 + i * 3;
    const unmatched = 3 + (i % 4);
    const failed = 1 + (i % 2);
    return { date, matched, unmatched, failed };
  });
  return NextResponse.json(days);
}


