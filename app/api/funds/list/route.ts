import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { id: 'ALJ-GROWTH', name: 'ALJ Growth Fund' },
    { id: 'ALPHA', name: 'Alpha Fund' },
    { id: 'BETA', name: 'Beta Fund' },
    { id: 'GAMMA', name: 'Gamma Fund' },
  ]);
}


