import { NextResponse } from 'next/server';

export async function GET() {
  const types = ['Exposure', 'Investment Limit', 'KYC', 'Best Execution', 'Concentration'];
  const rows = types.map((breach_type, i) => ({ breach_type, count: 3 + (i % 5) }));
  return NextResponse.json(rows);
}

