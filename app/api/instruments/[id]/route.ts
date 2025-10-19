import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'instruments.json');

async function readAll() {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  return JSON.parse(raw || '[]');
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const arr = await readAll();
  const item = arr.find((x: any) => x.id === params.id);
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const arr = await readAll();
  const idx = arr.findIndex((x: any) => x.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
  arr[idx] = { ...arr[idx], ...body, id: params.id };
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const arr = await readAll();
  const next = arr.filter((x: any) => x.id !== params.id);
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

