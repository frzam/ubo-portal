import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ count: 3, items: ['NAV approval pending', 'Settlement confirm', 'Reconciliation break'] }); }

