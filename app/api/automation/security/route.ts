import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { process_type: 'Automated', percentage: 72 },
    { process_type: 'Manual', percentage: 28 },
  ]);
}

