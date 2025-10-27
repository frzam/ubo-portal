import { NextRequest, NextResponse } from 'next/server';
import { getCustomerKey, makeCustomerData } from '../_data';

// Ensure per-request data based on query (cif/id_number)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const key = getCustomerKey(req);
  const data = makeCustomerData(key);
  return NextResponse.json(data.assets_summary);
}
