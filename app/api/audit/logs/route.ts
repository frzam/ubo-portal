import { NextResponse } from 'next/server';
// Always read the latest audit-log.json on each request
export const dynamic = 'force-dynamic';
import { readAudit } from '@/lib/audit';

export async function GET() {
  try {
    const logs = await readAudit();
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}


