import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const items = [
    { date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)), type: 'Dividend', title: 'Dividend $0.12', fund: 'Alpha Fund' },
    { date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)), type: 'Split', title: '2-for-1 Split', fund: 'Beta Fund' },
    { date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4)), type: 'Rights', title: 'Rights Issue', fund: 'Gamma Fund' },
  ];
  return NextResponse.json(items);
}

