"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KpiCard } from '@/components/dashboard/KpiCard';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Kpis = { trades_today: number; nav_completed: number; recon_breaks: number; compliance_alerts: number; automation_ratio: number };

export default function AssetManagerDashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [lifecycle, setLifecycle] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any[]>([]);
  const [recon, setRecon] = useState<any[]>([]);
  const [navStatus, setNavStatus] = useState<any[]>([]);
  const [navTrend, setNavTrend] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [breaches, setBreaches] = useState<any[]>([]);
  const [automation, setAutomation] = useState<any[]>([]);
  const [corpActions, setCorpActions] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [auditIssues, setAuditIssues] = useState<any[]>([]);
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
      fetch('/api/dashboard/manager-kpis').then(j),
      fetch('/api/trades/lifecycle').then(j),
      fetch('/api/settlement/performance').then(j),
      fetch('/api/reconciliation/breaks').then(j),
      fetch('/api/nav/status').then(j),
      fetch('/api/nav/trend').then(j),
      fetch('/api/positions/summary').then(j),
      fetch('/api/compliance/breaches').then(j),
      fetch('/api/operations/automation').then(j),
      fetch('/api/corporate_actions/upcoming').then(j),
      fetch('/api/workflow/pending').then(j),
      fetch('/api/audit/issues').then(j),
      fetch('/api/reference/health').then(j),
    ]).then(([
      k,
      lifecycle,
      settle,
      reconB,
      navS,
      navT,
      pos,
      breaches,
      auto,
      corpActs,
      work,
      audit,
      refH,
    ]) => {
      if (!alive) return;
      if (k) setKpis(k);
      if (lifecycle) setLifecycle(lifecycle);
      if (settle) setSettlement(settle);
      if (reconB) setRecon(reconB);
      if (navS) setNavStatus(navS);
      if (navT) setNavTrend(navT);
      if (pos) setPositions(pos);
      if (breaches) setBreaches(breaches);
      if (auto) setAutomation(auto);
      if (corpActs) setCorpActions(corpActs);
      if (work) setWorkflow(work);
      if (audit) setAuditIssues(audit);
      if (refH) setRefHealth(refH);
    });
    return () => {
      alive = false;
    };
  }, []);

  const lifecycleOption = useMemo(() => {
    if (!lifecycle || lifecycle.length === 0) return null as any;
    const dates = lifecycle.map((d) => d.date);
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { bottom: 8, itemGap: 12, padding: [2, 0, 0, 0], textStyle: { color: cssVar('--muted-foreground', fg), fontSize: 11 } },
      grid: { left: 56, right: 16, top: 24, bottom: 80 },
      xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12 }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12, formatter: (v: number) => formatK(v) }, splitLine: { show: true, lineStyle: { color: border } } },
      series: [
        { name: 'Matched', type: 'bar', stack: 'total', data: lifecycle.map((d) => d.matched) },
        { name: 'Unmatched', type: 'bar', stack: 'total', data: lifecycle.map((d) => d.unmatched) },
        { name: 'Failed', type: 'bar', stack: 'total', data: lifecycle.map((d) => d.failed) },
      ],
    } as any;
  }, [lifecycle, themeVersion]);

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
      xAxis: { type: 'category', data: settlement.map((d) => d.date), axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12 }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: cssVar('--muted-foreground', fg), margin: 12 }, axisLine: { lineStyle: { color: border } }, splitLine: { show: true, lineStyle: { color: border } } },
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
      series: [{ name: 'Breaks', type: 'heatmap', data }],
    } as any;
  }, [recon, themeVersion]);

  const navStatusOption = useMemo(() => {
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

  const navTrendOption = useMemo(() => {
    if (!navTrend || navTrend.length === 0) return null as any;
    const dates = navTrend.map((d) => d.date);
    const keys = Object.keys(navTrend[0] || {}).filter((k) => k !== 'date');
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { bottom: 24, itemGap: 12, padding: [6, 0, 0, 0], textStyle: { color: cssVar('--muted-foreground', fg), fontSize: 11 } },
      grid: { left: 56, right: 16, top: 24, bottom: 64 },
      xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12 }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12, formatter: (v: number) => formatK(v) }, splitLine: { show: true, lineStyle: { color: border } } },
      series: keys.map((k) => ({ name: k, type: 'line', showSymbol: false, lineStyle: { width: 1.5 }, data: navTrend.map((d) => d[k]) })),
    } as any;
  }, [navTrend, themeVersion]);

  const positionsOption = useMemo(() => {
    if (!positions || positions.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { bottom: 8, itemGap: 12, padding: [2, 0, 0, 0], textStyle: { color: cssVar('--muted-foreground', fg), fontSize: 11 } },
      grid: { left: 56, right: 16, top: 24, bottom: 72 },
      xAxis: { type: 'category', data: positions.map((d) => d.date), axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12 }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12, formatter: (v: number) => formatK(v) }, splitLine: { show: true, lineStyle: { color: border } } },
      series: [
        { name: 'Cash Balance', type: 'line', areaStyle: {}, stack: 'total', showSymbol: false, data: positions.map((d) => d.cash_balance) },
        { name: 'Security Value', type: 'line', areaStyle: {}, stack: 'total', showSymbol: false, data: positions.map((d) => d.security_value) },
      ],
    } as any;
  }, [positions, themeVersion]);

  const breachesOption = useMemo(() => {
    if (!breaches || breaches.length === 0) return null as any;
    const counts: Record<string, number> = {};
    for (const b of breaches) counts[b.status ?? 'Unknown'] = (counts[b.status ?? 'Unknown'] || 0) + 1;
    const categories = Object.keys(counts);
    const values = categories.map((k) => counts[k]);
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      grid: { left: 120, right: 16, top: 24, bottom: 24 },
      xAxis: { type: 'value', axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), formatter: (v: number) => formatK(v) }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'category', data: categories, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg) } },
      series: [{ type: 'bar', data: values }],
    } as any;
  }, [breaches, themeVersion]);

  const automationOption = useMemo(() => {
    if (!automation || automation.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    const palette = [cssVar('--chart-1', '#6366f1'), cssVar('--chart-2', '#8b5cf6')];
    return {
      backgroundColor: card,
      tooltip: { trigger: 'item', formatter: '{b}: {c}%', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { orient: 'vertical', right: 0, top: 'middle', itemGap: 10, textStyle: { color: cssVar('--muted-foreground', fg), fontSize: 11 } },
      color: palette,
      series: [
        {
          type: 'pie',
          center: ['36%', '52%'],
          radius: ['46%', '70%'],
          selectedMode: false,
          hoverAnimation: false,
          emphasis: { disabled: true },
          itemStyle: { borderColor: card, borderWidth: 1 },
          label: { show: true, color: fg, formatter: (p: any) => `${p.name} ${(p.percent || 0).toFixed(0)}%` },
          labelLine: { show: true, length: 8, length2: 8 },
          data: automation.map((d) => ({ name: d.process_type, value: d.percentage })),
        },
      ],
    } as any;
  }, [automation, themeVersion]);

  const radarOption = useMemo(() => {
    if (!refHealth || refHealth.length === 0) return null as any;
    return {
      tooltip: {},
      radar: { indicator: refHealth.map((d) => ({ name: d.category ?? d.domain, max: 100 })) },
      series: [
        {
          type: 'radar',
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 2, color: 'var(--primary)' },
          data: [
            { value: refHealth.map((d) => d.score), name: 'Data Quality' },
          ],
        },
      ],
    } as any;
  }, [refHealth]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Asset Manager Back‑Office Dashboard</h1>
      <p className="mt-1 text-slate-600 text-sm">Operational KPIs and team oversight for asset managers.</p>

      {/* KPI row */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Trades Processed" value={kpis?.trades_today ?? '—'} color="blue" />
        <KpiCard label="NAVs Computed" value={kpis?.nav_completed ?? '—'} color="green" />
        <KpiCard label="Recon Breaks" value={kpis?.recon_breaks ?? '—'} color="red" onClick={() => router.push('/reconciliation?status=Mismatched')} />
        <KpiCard label="Compliance Alerts" value={kpis?.compliance_alerts ?? '—'} color="orange" />
        <KpiCard label="Automation Rate (%)" value={kpis?.automation_ratio ?? '—'} color="green" />
        <KpiCard label="Funds Tracked" value={3} color="blue" />
      </div>

      {/* Charts row 1 */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Trade & Settlement Lifecycle</h2>
          <div className="mt-2 h-[200px]">
            {lifecycleOption ? (
              // @ts-ignore
              <ReactECharts option={lifecycleOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Settlement Success Trend</h2>
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
            {navStatusOption ? (
              // @ts-ignore
              <ReactECharts option={navStatusOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">NAV Trend per Fund</h2>
          <div className="mt-2 h-[200px]">
            {navTrendOption ? (
              // @ts-ignore
              <ReactECharts option={navTrendOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Cash & Position Summary</h2>
          <div className="mt-2 h-[200px]">
            {positionsOption ? (
              // @ts-ignore
              <ReactECharts option={positionsOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Compliance Breaches</h2>
          <div className="mt-2 h-[200px]">
            {breachesOption ? (
              // @ts-ignore
              <ReactECharts option={breachesOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 3 */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Automation vs Manual</h2>
          <div className="mt-2 h-[220px]">
            {automationOption ? (
              // @ts-ignore
              <ReactECharts option={automationOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Reference Data Quality</h2>
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

      {/* Lists & Tables */}
      <div className="mt-4 grid gap-3 grid-cols-1 xl:grid-cols-2">
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
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Pending Approvals & Tasks</h2>
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

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium text-[color:var(--foreground)]">Open Audit & Exception Items</h2>
        <div className="mt-2 h-64 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">Audit Point</th>
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Assigned To</th>
                <th className="py-2 pr-4">Target Date</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditIssues.map((a, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-4">{a.auditPoint}</td>
                  <td className="py-2 pr-4">{a.severity}</td>
                  <td className="py-2 pr-4">{a.assignedTo}</td>
                  <td className="py-2 pr-4">{a.targetDate}</td>
                  <td className="py-2 pr-4">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
