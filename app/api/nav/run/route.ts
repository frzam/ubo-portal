import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'nav_runs.json');

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
  if (!b || !b.fund || !b.date) return NextResponse.json({ success: false, error: 'fund, date required' }, { status: 400 });
  const arr = await readAll();
  const run = { id: 'NAV' + Math.random().toString(36).slice(2, 8).toUpperCase(), fund: b.fund, date: b.date, status: 'Running', created_at: new Date().toISOString() };
  arr.push(run);
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true, id: run.id });
}

