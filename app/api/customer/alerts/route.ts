import { NextRequest, NextResponse } from 'next/server';
import { getCustomerKey, makeCustomerData } from '../_data';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const key = getCustomerKey(req);
  const data = makeCustomerData(key);
  return NextResponse.json(data.alerts);
}


