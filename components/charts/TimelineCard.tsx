'use client';

import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const option: any = {
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 16, top: 24, bottom: 28 },
  xAxis: { type: 'time', axisLine: { lineStyle: { color: 'var(--border)' } } },
  yAxis: { type: 'value', axisLine: { lineStyle: { color: 'var(--border)' } } },
  series: [
    {
      type: 'line',
      name: 'AUM',
      showSymbol: false,
      lineStyle: { width: 2, color: 'var(--primary)' },
      areaStyle: { color: 'var(--muted)' },
      data: [
        ['2025-01-01', 320],
        ['2025-02-01', 410],
        ['2025-03-01', 380],
        ['2025-04-01', 450],
        ['2025-05-01', 470],
        ['2025-06-01', 495],
      ],
    },
  ],
};

export function TimelineCard() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-medium text-[color:var(--foreground)]">AUM Over Time</h2>
      <div className="mt-2 h-[280px]">
        {/* @ts-ignore */}
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}

