import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const data = [...Array(6)].map((_, i) => {
    const d = new Date(now);
    d.setMonth(now.getMonth() - (5 - i));
    const month = months[d.getMonth()];
    return { month, inflows: 80000 + i * 5000, outflows: 60000 + i * 4000 };
  });
  return NextResponse.json(data);
}


