'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const barData = [
  { label: 'Q1', aum: 320 },
  { label: 'Q2', aum: 410 },
  { label: 'Q3', aum: 380 },
  { label: 'Q4', aum: 450 },
];

export function BarCard() {
  const formatK = (v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`);
  const axisTick = { fill: 'var(--muted-foreground)', fontSize: 12 } as const;
  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)'
  } as const;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-medium text-[color:var(--foreground)]">Quarterly AUM</h2>
      <div className="mt-2 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} />
            <YAxis width={48} tick={axisTick} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} tickFormatter={formatK} domain={[0, 'auto']} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--muted-foreground)' }} itemStyle={{ color: 'var(--foreground)' }} formatter={(v: any) => [typeof v === 'number' ? formatK(v) : v, 'AUM']} />
            <Bar dataKey="aum" fill="var(--primary)" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
