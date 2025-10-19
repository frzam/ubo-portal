import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json([
    { product: 'Mutual Funds', asset_value: 450000 },
    { product: 'Equities', asset_value: 220000 },
    { product: 'Fixed Income', asset_value: 160000 },
    { product: 'Deposits', asset_value: 80000 },
  ]);
}

