import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  return NextResponse.json([
    { process_type: 'Automated', percentage: 72 },
    { process_type: 'Manual', percentage: 28 },
  ]);
}


