import { NextResponse } from 'next/server';

export async function POST() {
  // Dev-only stub: in non-production, just acknowledge resend
  // In a real environment, call your backend to trigger delivery
  return NextResponse.json({ success: true });
}

