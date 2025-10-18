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
  try {
    const { otp } = (await req.json().catch(() => ({}))) as { otp?: string };

    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 });
    }

    const url = process.env.AUTH_BACKEND_OTP_URL;
    if (url) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp }),
          cache: 'no-store',
        });

        const contentType = res.headers.get('content-type') || '';
        let payload: any = null;
        if (contentType.includes('application/json')) {
          payload = await res.json().catch(() => null);
        }

        const success = typeof payload === 'boolean' ? payload : payload?.success === true;
        if (success && res.ok) {
          const response = NextResponse.json({ success: true });
          response.cookies.set({
            name: 'ubo_session',
            value: 'true',
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8, // 8 hours
          });
          const claims = decodeClaims(req.cookies.get('ubo_claims')?.value);
          const ip = req.headers.get('x-forwarded-for') || undefined;
          const ua = req.headers.get('user-agent') || undefined;
          if (claims?.username) {
            await appendAudit({
              type: 'login',
              username: claims.username,
              timestamp: new Date().toISOString(),
              ip,
              userAgent: ua,
            });
          }
          return response;
        }
        return NextResponse.json(
          { success: false, error: payload?.error || 'Invalid code' },
          { status: 401 }
        );
      } catch (err) {
        return NextResponse.json(
          { success: false, error: 'Verification service unreachable' },
          { status: 502 }
        );
      }
    }

    // Dev fallback (no backend configured)
    const ok = otp === '123456';
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 401 });
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'ubo_session',
      value: 'true',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    const claims = decodeClaims(req.cookies.get('ubo_claims')?.value);
    const ip = req.headers.get('x-forwarded-for') || undefined;
    const ua = req.headers.get('user-agent') || undefined;
    if (claims?.username) {
      await appendAudit({
        type: 'login',
        username: claims.username,
        timestamp: new Date().toISOString(),
        ip,
        userAgent: ua,
      });
    }
    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}
