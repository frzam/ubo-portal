'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const seriesData: [string, number][] = [
  ['2025-01-01', 320],
  ['2025-02-01', 410],
  ['2025-03-01', 380],
  ['2025-04-01', 450],
  ['2025-05-01', 470],
  ['2025-06-01', 495],
];

function cssVar(name: string, fallback?: string) {
  if (typeof window === 'undefined') return fallback || '';
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v?.trim() || fallback || '';
}

function formatK(v: number) {
  return Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`;
}

export function TimelineCard() {
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          setThemeVersion((v) => v + 1);
        }
      }
    });
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const option = useMemo(() => {
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    const muted = cssVar('--muted', '#eee');
    const primary = cssVar('--primary', '#6366f1');
    const maxVal = Math.max(...seriesData.map((d) => d[1]));
    const paddedMax = Math.ceil((maxVal * 1.05) / 10) * 10; // pad 5%
    return {
      backgroundColor: card,
      textStyle: { color: fg },
      tooltip: {
        trigger: 'axis',
        backgroundColor: card,
        borderColor: border,
        textStyle: { color: fg },
      },
      grid: { left: 48, right: 16, top: 24, bottom: 28 },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: cssVar('--muted-foreground', fg) },
        splitLine: { show: true, lineStyle: { color: border } },
      },
      yAxis: {
        type: 'value',
        max: paddedMax,
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: cssVar('--muted-foreground', fg), formatter: (v: number) => formatK(v) },
        splitLine: { show: true, lineStyle: { color: border } },
      },
      series: [
        {
          type: 'line',
          name: 'AUM',
          showSymbol: false,
          lineStyle: { width: 2, color: primary },
          areaStyle: { color: muted },
          data: seriesData,
        },
      ],
    } as any;
  }, [themeVersion]);

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
