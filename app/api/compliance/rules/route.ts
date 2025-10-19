import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'compliance_rules.json');

async function readAll() {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  return JSON.parse(raw || '[]');
}

export async function GET() { return NextResponse.json(await readAll()); }

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b || !b.id || !b.name) return NextResponse.json({ success: false, error: 'id, name required' }, { status: 400 });
  const arr = await readAll();
  if (arr.find((x: any) => x.id === b.id)) return NextResponse.json({ success: false, error: 'duplicate id' }, { status: 409 });
  arr.push(b);
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

