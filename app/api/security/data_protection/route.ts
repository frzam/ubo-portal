import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { category: 'Databases', score: 92 },
    { category: 'APIs', score: 88 },
    { category: 'Files', score: 81 },
    { category: 'Backups', score: 86 },
  ]);
}

