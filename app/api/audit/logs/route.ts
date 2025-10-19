import { NextResponse } from 'next/server';
import { readAudit } from '@/lib/audit';

export async function GET() {
  try {
    const logs = await readAudit();
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

