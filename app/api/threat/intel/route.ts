import { NextResponse } from 'next/server';

export async function GET() {
  const rows = [
    { date: '2025-10-18', threatType: 'Phishing', source: 'Vendor Feed A', severity: 'Medium', status: 'Monitoring' },
    { date: '2025-10-18', threatType: 'CVE-2025-1234', source: 'NVD', severity: 'High', status: 'Assessing' },
    { date: '2025-10-19', threatType: 'Ransomware IOC', source: 'Vendor Feed B', severity: 'Critical', status: 'Blocked' },
  ];
  return NextResponse.json(rows);
}

