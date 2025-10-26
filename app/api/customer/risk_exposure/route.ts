import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json([
    { asset_class: 'Equities', exposure_score: 72 },
    { asset_class: 'Fixed Income', exposure_score: 48 },
    { asset_class: 'Alternatives', exposure_score: 35 },
    { asset_class: 'Real Estate', exposure_score: 40 },
    { asset_class: 'Cash', exposure_score: 20 },
  ]);
}


