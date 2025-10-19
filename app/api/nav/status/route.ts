import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { status: 'Completed', count: 34 },
    { status: 'Pending', count: 6 },
    { status: 'Failed', count: 2 },
  ]);
}

