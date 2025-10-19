import { NextResponse } from 'next/server';

export async function GET() {
  const funds = ['Alpha Fund', 'Beta Fund', 'Gamma Fund', 'Delta Fund'];
  const types = ['Cash', 'Position', 'Price', 'FX'];
  const data: { fund_name: string; exception_type: string; count: number }[] = [];
  for (const f of funds) {
    for (const t of types) {
      data.push({ fund_name: f, exception_type: t, count: Math.floor(Math.random() * 6) });
    }
  }
  return NextResponse.json(data);
}

