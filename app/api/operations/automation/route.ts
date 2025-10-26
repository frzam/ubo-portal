import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  // STP (automated) vs Manual; values should sum to 100
  return NextResponse.json([
    { process_type: 'STP', percentage: 84 },
    { process_type: 'Manual', percentage: 16 },
  ]);
}


