import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'trades.json');

async function readAll() {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  return JSON.parse(raw || '[]');
}

export async function GET() {
  const arr = await readAll();
  return NextResponse.json(arr);
}

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b || !b.fund || !b.symbol || !b.side || !b.quantity || !b.price) {
    return NextResponse.json({ success: false, error: 'fund, symbol, side, quantity, price required' }, { status: 400 });
  }
  const arr = await readAll();
  const trade = {
    id: 'T' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    created_at: new Date().toISOString(),
    ...b,
  };
  arr.push(trade);
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true, id: trade.id });
}

