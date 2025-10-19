import { NextRequest, NextResponse } from 'next/server';
import rolesMap from '@/config/roles.json';

function decodeClaims(value?: string | null) {
  if (!value) return null;
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');
    return JSON.parse(json) as { username: string; roles: string[] };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets (e.g., images, icons, etc.)
  const isStaticAsset = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json)$/.test(pathname);
  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Allow auth routes and Next.js internals
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get('ubo_session');
  if (!session) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  // Simple RBAC for protected paths
  const protectedRoutes: Record<string, string> = {
    '/compliance': 'compliance:view',
    '/clients': 'clients:view',
    '/trades': 'portfolios:view',
    '/nav': 'portfolios:view',
    '/reconciliation': 'portfolios:view',
    '/corporate-actions': 'portfolios:view',
    '/compliance-risk': 'portfolios:view',
    '/data-management': 'portfolios:view',
    '/reports': 'portfolios:view',
    '/workflow': 'portfolios:view',
  };
  const required = Object.entries(protectedRoutes).find(([p]) => pathname.startsWith(p))?.[1];
  if (required) {
    const claims = decodeClaims(req.cookies.get('ubo_claims')?.value);
    const permissions = new Set<string>();
    for (const role of claims?.roles || []) {
      for (const p of (rolesMap as Record<string, string[]>)[role] || []) permissions.add(p);
    }
    if (!permissions.has(required)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Enforce role access for dashboard routes
  if (pathname.startsWith('/dashboard/')) {
    const claims = decodeClaims(req.cookies.get('ubo_claims')?.value);
    const roles = new Set(claims?.roles || []);
    const seg = pathname.split('/')[2] || '';
    const roleRequired = seg === 'admin'
      ? 'admin'
      : seg === 'infosec'
      ? 'infosec_admin'
      : seg === 'asset-manager'
      ? 'asset_manager'
      : seg === 'asset-user'
      ? 'asset_user'
      : null;
    if (roleRequired && !roles.has(roleRequired)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
