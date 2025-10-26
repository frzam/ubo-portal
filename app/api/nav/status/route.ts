import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { status: 'Completed', count: 34 },
    { status: 'Pending', count: 6 },
    { status: 'Failed', count: 2 },
  ]);
}


