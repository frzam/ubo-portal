import { NextRequest, NextResponse } from 'next/server';
import { appendAudit } from '@/lib/audit';

function decodeClaims(value?: string | null) {
  if (!value) return null;
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');
    return JSON.parse(json) as { username: string; roles: string[] };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  const claims = decodeClaims(req.cookies.get('ubo_claims')?.value);
  const ip = req.headers.get('x-forwarded-for') || undefined;
  const ua = req.headers.get('user-agent') || undefined;
  if (claims?.username) {
    await appendAudit({
      type: 'logout',
      username: claims.username,
      timestamp: new Date().toISOString(),
      ip,
      userAgent: ua,
    });
  }
  res.cookies.set({
    name: 'ubo_session',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  res.cookies.set({
    name: 'ubo_claims',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  return res;
}
