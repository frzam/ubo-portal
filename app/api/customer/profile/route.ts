import { NextRequest, NextResponse } from 'next/server';
import { getCustomerKey, getIdentity, makeCustomerData } from '../_data';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const key = getCustomerKey(req);
  const id = getIdentity(req);
  const data = makeCustomerData(key, id);
  return NextResponse.json(data.profile);
}
