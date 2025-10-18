import { NextRequest, NextResponse } from 'next/server';
import usersDev from '@/config/users.dev.json';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const url = process.env.AUTH_BACKEND_LOGIN_URL;
    if (url) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          // Prevent caching of auth requests
          cache: 'no-store',
        });

        const contentType = res.headers.get('content-type') || '';
        let payload: any = null;
        if (contentType.includes('application/json')) {
          payload = await res.json().catch(() => null);
        }

        // Accept either boolean or { success: boolean }
        const success = typeof payload === 'boolean' ? payload : payload?.success === true;
        if (success && res.ok) {
          const roles: string[] = Array.isArray((payload as any)?.roles)
            ? (payload as any).roles
            : ['admin'];
          const claims = { username, roles };
          const enc = Buffer.from(JSON.stringify(claims)).toString('base64url');
          const response = NextResponse.json({ success: true });
          response.cookies.set({
            name: 'ubo_claims',
            value: enc,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8,
          });
          return response;
        }
        return NextResponse.json(
          { success: false, error: payload?.error || 'Invalid username or password' },
          { status: 401 }
        );
      } catch (err) {
        return NextResponse.json(
          { success: false, error: 'Authentication service unreachable' },
          { status: 502 }
        );
      }
    }

    // Dev fallback (no backend configured)
    const devEntry = (usersDev as Record<string, { roles: string[]; password?: string }>)[username];
    let ok = false;
    if (devEntry) {
      ok = devEntry.password ? password === devEntry.password : true;
    }
    if (!ok && username === 'admin' && password === 'admin4ubo') {
      ok = true;
    }
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }
    const devRoles = devEntry?.roles || ['admin'];
    const claims = { username, roles: devRoles };
    const enc = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'ubo_claims',
      value: enc,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}
