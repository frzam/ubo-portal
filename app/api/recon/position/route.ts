import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'recon_position.json');

export async function GET() {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  const arr = JSON.parse(raw || '[]');
  return NextResponse.json(arr);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  const arr = JSON.parse(raw || '[]');
  const idx = arr.findIndex((x: any) => x.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  arr[idx] = { ...arr[idx], matched: true, reason: undefined, closed_by: 'user', closed_at: new Date().toISOString() };
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

