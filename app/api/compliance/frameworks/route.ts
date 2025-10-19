import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { framework: 'ISO 27001', compliance_percentage: 92 },
    { framework: 'NIST CSF', compliance_percentage: 88 },
    { framework: 'SAMA', compliance_percentage: 85 },
    { framework: 'PDPL', compliance_percentage: 81 },
  ]);
}

