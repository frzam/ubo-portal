import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const { task_id, assignee } = body || {};
  if (!task_id || !assignee) {
    return NextResponse.json({ success: false, error: 'task_id and assignee are required' }, { status: 400 });
  }
  // Mock success; in real implementation, persist change via backend
  return NextResponse.json({ success: true });
}

