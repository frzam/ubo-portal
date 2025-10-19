import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date();
  const data = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      privilege_granted: 1 + (i % 3),
      privilege_revoked: i % 2,
    };
  });
  return NextResponse.json(data);
}

