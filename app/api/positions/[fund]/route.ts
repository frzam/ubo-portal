import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const tradesPath = path.join(process.cwd(), 'data', 'trades.json');
const instPath = path.join(process.cwd(), 'data', 'instruments.json');

export async function GET(_: NextRequest, { params }: { params: { fund: string } }) {
  const rawTrades = await fs.readFile(tradesPath, 'utf8').catch(() => '[]');
  const trades = JSON.parse(rawTrades || '[]').filter((t: any) => t.fund === params.fund);
  const rawInst = await fs.readFile(instPath, 'utf8').catch(() => '[]');
  const inst = JSON.parse(rawInst || '[]');
  const priceMap = Object.fromEntries(inst.map((i: any) => [i.symbol, 100])); // mock flat price
  const posMap: Record<string, { symbol: string; quantity: number; avg_price: number; market_value: number }> = {};
  for (const t of trades) {
    const q = Number(t.quantity) * (t.side?.toLowerCase() === 'sell' ? -1 : 1);
    const key = t.symbol;
    if (!posMap[key]) posMap[key] = { symbol: key, quantity: 0, avg_price: 0, market_value: 0 };
    // simple running avg
    const p = Number(t.price);
    const prev = posMap[key];
    const newQty = prev.quantity + q;
    const cost = prev.avg_price * prev.quantity + p * q;
    prev.quantity = newQty;
    prev.avg_price = newQty !== 0 ? cost / newQty : prev.avg_price;
  }
  for (const k of Object.keys(posMap)) {
    posMap[k].market_value = posMap[k].quantity * (priceMap[k] || 0);
  }
  return NextResponse.json(Object.values(posMap));
}

