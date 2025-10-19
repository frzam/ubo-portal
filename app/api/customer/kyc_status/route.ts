import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json([
    { status_type: 'KYC Complete', count: 1 },
    { status_type: 'AML Screening', count: 1 },
    { status_type: 'FATCA', count: 1 },
    { status_type: 'CRS', count: 1 },
  ]);
}

