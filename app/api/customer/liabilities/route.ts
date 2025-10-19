import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json([
    { facility_type: 'Margin Loan', outstanding_amount: 120000 },
    { facility_type: 'Overdraft', outstanding_amount: 40000 },
  ]);
}

