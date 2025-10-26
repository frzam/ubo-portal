import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  const today = new Date();
  const rows = [...Array(14)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    const date = d.toISOString().slice(0, 10);
    const compliance_rate = 88 + Math.round(Math.sin(i / 2) * 6);
    return { date, compliance_rate };
  });
  return NextResponse.json(rows);
}


