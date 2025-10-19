import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: 'ALJ-GROWTH', name: 'ALJ Growth Fund' },
    { id: 'ALPHA', name: 'Alpha Fund' },
    { id: 'BETA', name: 'Beta Fund' },
    { id: 'GAMMA', name: 'Gamma Fund' },
  ]);
}

