import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'instruments.json');

export async function GET() {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  const arr = JSON.parse(raw || '[]');
  return NextResponse.json(arr);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.id || !body.symbol || !body.name) {
    return NextResponse.json({ success: false, error: 'id, symbol, name required' }, { status: 400 });
  }
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  const arr = JSON.parse(raw || '[]');
  if (arr.find((x: any) => x.id === body.id)) {
    return NextResponse.json({ success: false, error: 'duplicate id' }, { status: 409 });
  }
  arr.push(body);
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

