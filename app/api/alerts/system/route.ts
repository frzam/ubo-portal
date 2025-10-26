import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 60;
export async function GET() { return NextResponse.json({ count: 1, items: ['Nightly job delayed'] }); }


