"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KpiCard } from '@/components/dashboard/KpiCard';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Kpis = { trades_today: number; nav_computed: number; recon_breaks: number; compliance_alerts: number };

export default function AssetUserDashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [tradeSummary, setTradeSummary] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any[]>([]);
  const [recon, setRecon] = useState<any[]>([]);
  const [navStatus, setNavStatus] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [corpActions, setCorpActions] = useState<any[]>([]);
  const [refHealth, setRefHealth] = useState<any[]>([]);
  // Theme reactivity for charts
  const [themeVersion, setThemeVersion] = useState(0);
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.attributeName === 'class') setThemeVersion((v) => v + 1);
      }
    });
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const cssVar = (name: string, fallback?: string) => {
    if (typeof window === 'undefined') return fallback || '';
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v?.trim() || fallback || '';
  };
  const formatK = (v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`);

  useEffect(() => {
    let alive = true;
    const j = (r: Response) => (r.ok ? r.json() : null);
    Promise.all([
      fetch('/api/dashboard/kpis').then(j),
      fetch('/api/trades/summary').then(j),
      fetch('/api/settlement/performance').then(j),
      fetch('/api/reconciliation/breaks').then(j),
      fetch('/api/nav/status').then(j),
      fetch('/api/compliance/alerts').then(j),
      fetch('/api/workflow/pending').then(j),
      fetch('/api/corporate_actions/upcoming').then(j),
      fetch('/api/reference/health').then(j),
    ]).then(([
      k,
      tradeSum,
      settle,
      reconB,
      navS,
      alerts,
      workflow,
      corpActs,
      refH,
    ]) => {
      if (!alive) return;
      if (k) setKpis(k);
      if (tradeSum) setTradeSummary(tradeSum);
      if (settle) setSettlement(settle);
      if (reconB) setRecon(reconB);
      if (navS) setNavStatus(navS);
      if (alerts) setAlerts(alerts);
      if (workflow) setWorkflow(workflow);
      if (corpActs) setCorpActions(corpActs);
      if (refH) setRefHealth(refH);
    });
    return () => {
      alive = false;
    };
  }, []);

  const tradeOption = useMemo(() => {
    const dates = Array.from(new Set(tradeSummary.map((d) => d.date))).sort();
    const statuses = Array.from(new Set(tradeSummary.map((d) => d.trade_status)));
    if (dates.length === 0 || statuses.length === 0) return null as any;
    const series = statuses.map((s) => ({
      name: s,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: dates.map((dt) => tradeSummary.find((d) => d.date === dt && d.trade_status === s)?.count ?? 0),
    }));
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { bottom: 16, itemGap: 12, padding: [4, 0, 0, 0], textStyle: { color: cssVar('--muted-foreground', fg) } },
      grid: { left: 56, right: 16, top: 24, bottom: 64, containLabel: true },
      xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12 }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12, formatter: (v: number) => formatK(v) }, splitLine: { show: true, lineStyle: { color: border } } },
      series,
    } as any;
  }, [tradeSummary, themeVersion]);

  const settlementOption = useMemo(() => {
    if (!settlement || settlement.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    const primary = cssVar('--primary', '#6366f1');
    const muted = cssVar('--muted', '#eee');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      grid: { left: 56, right: 16, top: 24, bottom: 64 },
      xAxis: { type: 'category', data: settlement.map((d) => d.date), axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg) }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: cssVar('--muted-foreground', fg) }, axisLine: { lineStyle: { color: border } }, splitLine: { show: true, lineStyle: { color: border } } },
      series: [
        {
          name: 'Success Rate',
          type: 'line',
          showSymbol: false,
          lineStyle: { width: 1.5, color: primary },
          areaStyle: { color: muted },
          data: settlement.map((d) => d.success_rate),
        },
      ],
    } as any;
  }, [settlement, themeVersion]);

  const reconOption = useMemo(() => {
    const funds = Array.from(new Set(recon.map((d) => d.fund_name)));
    const types = Array.from(new Set(recon.map((d) => d.exception_type)));
    if (funds.length === 0 || types.length === 0) return null as any;
    const data = recon.map((d) => [funds.indexOf(d.fund_name), types.indexOf(d.exception_type), d.count]);
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { position: 'top', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      grid: { left: 80, right: 72, top: 24, bottom: 24 },
      xAxis: { type: 'category', data: funds, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg) } },
      yAxis: { type: 'category', data: types, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg) } },
      visualMap: { min: 0, max: 6, calculable: false, orient: 'vertical', right: 0, top: 'middle', textStyle: { color: cssVar('--muted-foreground', fg) } },
      series: [{ name: 'Breaks', type: 'heatmap', data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 10 } } }],
    } as any;
  }, [recon, themeVersion]);

  const navOption = useMemo(() => {
    if (!navStatus || navStatus.length === 0) return null as any;
    const total = navStatus.reduce((a, b) => a + (b.count || 0), 0) || 1;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { orient: 'vertical', right: 0, top: 'middle', itemGap: 10, textStyle: { color: cssVar('--muted-foreground', fg), fontSize: 11 } },
      series: [
        {
          type: 'pie',
          center: ['36%', '52%'],
          radius: ['46%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: card, borderWidth: 1 },
          label: { show: true, color: fg, formatter: (p: any) => `${p.name} ${(p.percent || 0).toFixed(0)}%` },
          labelLayout: { hideOverlap: true },
          labelLine: { show: true, length: 8, length2: 8 },
          data: navStatus.map((d) => ({ name: d.status, value: d.count })),
        },
      ],
    } as any;
  }, [navStatus, themeVersion]);

  const radarOption = useMemo(() => {
    if (!refHealth || refHealth.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      tooltip: { backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      radar: {
        indicator: refHealth.map((d) => ({ name: d.category, max: 100 })),
        axisName: { color: fg },
      },
      series: [
        {
          type: 'radar',
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2, color: cssVar('--primary', '#6366f1') },
          data: [
            {
              value: refHealth.map((d) => d.score),
              name: 'Data Health',
            },
          ],
        },
      ],
    } as any;
  }, [refHealth, themeVersion]);

  const unmatchedToday = useMemo(() => {
    if (!tradeSummary || tradeSummary.length === 0) return null as number | null;
    const dates = Array.from(new Set(tradeSummary.map((d) => d.date))).sort();
    const last = dates[dates.length - 1];
    const sum = tradeSummary
      .filter((d) => d.date === last && String(d.trade_status).toLowerCase() === 'unmatched')
      .reduce((a, b) => a + (b.count || 0), 0);
    return sum;
  }, [tradeSummary]);

  const settlementToday = useMemo(() => {
    if (!settlement || settlement.length === 0) return null as number | null;
    return settlement[settlement.length - 1]?.success_rate ?? null;
  }, [settlement]);

  const navPending = useMemo(() => {
    if (!navStatus || navStatus.length === 0) return null as number | null;
    return navStatus.find((d) => String(d.status).toLowerCase() === 'pending')?.count ?? 0;
  }, [navStatus]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Asset Back-Office Dashboard</h1>
      <p className="mt-1 text-slate-600 text-sm">Operational KPIs and workflows for back-office users.</p>

      {/* KPI row */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Trades Today" value={kpis?.trades_today ?? '—'} color="blue" />
        <KpiCard label="Unmatched Trades" value={unmatchedToday ?? '—'} color="orange" />
        <KpiCard label="Settlement Success (%)" value={settlementToday ?? '—'} color="green" />
        <KpiCard label="NAV Computed" value={kpis?.nav_computed ?? '—'} color="green" />
        <KpiCard label="NAV Pending" value={navPending ?? '—'} color="orange" />
        <KpiCard label="Recon Breaks" value={kpis?.recon_breaks ?? '—'} color="red" onClick={() => router.push('/reconciliation?status=Mismatched')} />
      </div>

      {/* Charts row 1 */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Trade Processing Summary</h2>
          <p className="text-xs text-slate-500">Matched vs Unmatched trades by day</p>
          <div className="mt-2 h-[200px]">
            {tradeOption ? (
              // @ts-ignore
              <ReactECharts option={tradeOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Settlement Success Rate</h2>
          <div className="mt-2 h-[200px]">
            {settlementOption ? (
              // @ts-ignore
              <ReactECharts option={settlementOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">NAV Computation Status</h2>
          <div className="mt-2 h-[200px]">
            {navOption ? (
              // @ts-ignore
              <ReactECharts option={navOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Reconciliation Exceptions by Fund</h2>
          <div className="mt-2 h-[220px]">
            {reconOption ? (
              // @ts-ignore
              <ReactECharts option={reconOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Reference Data Health</h2>
          <div className="mt-2 h-[220px]">
            {radarOption ? (
              // @ts-ignore
              <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Tables + Calendar (denser, two columns) */}
      <div className="mt-4 grid gap-3 grid-cols-1 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Compliance & Regulatory Alerts</h2>
          <div className="mt-2 h-64 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Alert Type</th>
                  <th className="py-2 pr-4">Severity</th>
                  <th className="py-2 pr-4">Fund</th>
                  <th className="py-2 pr-4">Due Date</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4">{a.alertType}</td>
                    <td className="py-2 pr-4">{a.severity}</td>
                    <td className="py-2 pr-4">{a.fund}</td>
                    <td className="py-2 pr-4">{a.dueDate}</td>
                    <td className="py-2 pr-4">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Upcoming Corporate Actions</h2>
          <ul className="mt-2 space-y-2 h-64 overflow-auto pr-1">
            {corpActions.map((c, i) => (
              <li key={i} className="rounded border border-[var(--border)] bg-white px-3 py-2">
                <div className="text-xs text-slate-500">{c.date} • {c.type}</div>
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-slate-600">{c.fund}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium text-[color:var(--foreground)]">Workflow Tasks Pending</h2>
        <div className="mt-2 h-64 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">Task</th>
                <th className="py-2 pr-4">Owner</th>
                <th className="py-2 pr-4">Priority</th>
                <th className="py-2 pr-4">Due Date</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {workflow.map((w, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-4">{w.task}</td>
                  <td className="py-2 pr-4">{w.owner}</td>
                  <td className="py-2 pr-4">{w.priority}</td>
                  <td className="py-2 pr-4">{w.dueDate}</td>
                  <td className="py-2 pr-4">{w.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
