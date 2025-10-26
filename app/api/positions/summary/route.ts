import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  const today = new Date();
  const rows = [...Array(10)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (9 - i));
    const date = d.toISOString().slice(0, 10);
    const cash_balance = 50 + Math.round(10 * Math.sin(i / 2));
    const security_value = 120 + Math.round(15 * Math.cos(i / 3));
    return { date, cash_balance, security_value };
  });
  return NextResponse.json(rows);
}


