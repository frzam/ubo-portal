'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const pieData = [
  { name: 'Equity', value: 45 },
  { name: 'Fixed Income', value: 30 },
  { name: 'Alternatives', value: 15 },
  { name: 'Cash', value: 10 },
];

const palette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

export function PieCard() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-medium text-[color:var(--foreground)]">Allocation</h2>
      <div className="mt-2 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--muted-foreground)' }} itemStyle={{ color: 'var(--foreground)' }} />
            <Legend
              verticalAlign="bottom"
              height={20}
              iconSize={10}
              wrapperStyle={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 6 }}
              formatter={(value: any) => (
                // Render as HTML so text color is respected in dark mode
                // eslint-disable-next-line react/jsx-key
                (value && String(value))
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
