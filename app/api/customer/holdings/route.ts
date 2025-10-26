import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json([
    { productType: 'Mutual Fund', accountNumber: 'MF-001234', currency: 'SAR', currentValue: 250000, lastTxnDate: '2025-10-15', status: 'Active' },
    { productType: 'Equity', accountNumber: 'EQ-004321', currency: 'SAR', currentValue: 180000, lastTxnDate: '2025-10-10', status: 'Active' },
    { productType: 'Fixed Income', accountNumber: 'FI-000987', currency: 'USD', currentValue: 120000, lastTxnDate: '2025-09-30', status: 'Active' },
    { productType: 'Deposit', accountNumber: 'DP-009876', currency: 'SAR', currentValue: 80000, lastTxnDate: '2025-10-01', status: 'Maturing' },
  ]);
}


