import { NextRequest, NextResponse } from 'next/server';
import rolesMap from '@/config/roles.json';
import usersDev from '@/config/users.dev.json';

function decodeClaims(value?: string | null) {
  if (!value) return null;
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');
    return JSON.parse(json) as { username: string; roles: string[] };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const claimsCookie = req.cookies.get('ubo_claims')?.value;
  const claims = decodeClaims(claimsCookie);
  if (!claims) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const permissions = new Set<string>();
  for (const role of claims.roles || []) {
    for (const p of (rolesMap as Record<string, string[]>)[role] || []) permissions.add(p);
  }
  const lastLoginAt = req.cookies.get('ubo_last_login')?.value || new Date().toISOString();
  const devInfo = (usersDev as any)[claims.username] || {};
  const fullName = devInfo.fullName || (claims.username?.replace(/_/g, ' ') || '').replace(/\b\w/g, (m: string) => m.toUpperCase()) || 'User';
  const employeeId = devInfo.employeeId || 'EMP-' + Math.abs(hashCode(claims.username || 'user')).toString().slice(0, 6);
  return NextResponse.json({
    username: claims.username,
    roles: claims.roles,
    permissions: Array.from(permissions),
    fullName,
    employeeId,
    lastLoginAt,
  });
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h;
}
