import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { category: 'Instruments', score: 86 },
    { category: 'Counterparties', score: 78 },
    { category: 'Pricing', score: 91 },
    { category: 'Benchmarks', score: 84 },
    { category: 'Corporate Actions', score: 73 },
  ]);
}


