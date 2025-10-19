import { NextResponse } from 'next/server';

export async function GET() {
  // STP (automated) vs Manual; values should sum to 100
  return NextResponse.json([
    { process_type: 'STP', percentage: 84 },
    { process_type: 'Manual', percentage: 16 },
  ]);
}

