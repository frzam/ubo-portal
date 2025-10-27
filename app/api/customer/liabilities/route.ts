import { NextRequest, NextResponse } from 'next/server';
import { getCustomerKey, makeCustomerData } from '../_data';

export async function GET(req: NextRequest) {
  const key = getCustomerKey(req);
  const data = makeCustomerData(key);
  return NextResponse.json(data.liabilities);
}


