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

export async function GET(req: NextRequest) {
  const claimsCookie = req.cookies.get('ubo_claims')?.value;
  const claims = decodeClaims(claimsCookie);
  if (!claims) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const permissions = new Set<string>();
  for (const role of claims.roles || []) {
    for (const p of (rolesMap as Record<string, string[]>)[role] || []) permissions.add(p);
  }
  return NextResponse.json({ username: claims.username, roles: claims.roles, permissions: Array.from(permissions) });
}

