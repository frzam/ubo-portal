import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'nav_runs.json');

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b || !b.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '[]');
  const arr = JSON.parse(raw || '[]');
  const idx = arr.findIndex((x: any) => x.id === b.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  arr[idx].status = 'Validated';
  arr[idx].checks = [{ name: 'Price variance', status: 'OK' }, { name: 'Accruals', status: 'OK' }];
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

