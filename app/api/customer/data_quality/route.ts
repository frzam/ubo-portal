import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data_completeness: 'Profile', score: 87 });
}

