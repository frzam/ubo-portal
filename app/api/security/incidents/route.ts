import { NextResponse } from 'next/server';

export async function GET() {
  const items = [
    { ts: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), title: 'Multiple failed logins from 10.2.3.4', status: 'Investigating' },
    { ts: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), title: 'Privileged token used outside office IP', status: 'Resolved' },
    { ts: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), title: 'WAF blocked SQLi attempt', status: 'Mitigated' },
  ];
  return NextResponse.json(items);
}

