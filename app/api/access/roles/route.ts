import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { role: 'Admin', user_count: 3 },
    { role: 'Asset Manager', user_count: 8 },
    { role: 'Back Office', user_count: 14 },
    { role: 'Compliance', user_count: 5 },
    { role: 'InfoSec', user_count: 2 },
  ]);
}

