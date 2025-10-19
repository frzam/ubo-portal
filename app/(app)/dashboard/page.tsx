import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function decodeClaims(value?: string | null): { username: string; roles: string[] } | null {
  if (!value) return null;
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function dashboardPathForRoles(roles: string[]): string {
  const set = new Set(roles);
  if (set.has('admin')) return '/dashboard/admin';
  if (set.has('infosec_admin')) return '/dashboard/infosec';
  if (set.has('asset_manager')) return '/dashboard/asset-manager';
  if (set.has('asset_user')) return '/dashboard/asset-user';
  return '/dashboard/admin';
}

export default function DashboardIndexPage() {
  const claims = decodeClaims(cookies().get('ubo_claims')?.value);
  if (!claims) redirect('/login');
  redirect(dashboardPathForRoles(claims.roles || []));
}

