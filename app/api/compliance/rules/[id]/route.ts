import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'compliance_rules.json');

async function readAll() {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  return JSON.parse(raw || '[]');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json().catch(() => null);
  const arr = await readAll();
  const idx = arr.findIndex((x: any) => x.id === params.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  arr[idx] = { ...arr[idx], ...b, id: params.id };
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const arr = await readAll();
  const next = arr.filter((x: any) => x.id !== params.id);
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

