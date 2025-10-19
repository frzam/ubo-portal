import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { severity: 'Critical', count: 2 },
    { severity: 'High', count: 5 },
    { severity: 'Medium', count: 11 },
    { severity: 'Low', count: 7 },
  ]);
}

