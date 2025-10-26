import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;
import { readAudit } from '@/lib/audit';

export async function GET() {
  try {
    const logs = await readAudit();
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}


