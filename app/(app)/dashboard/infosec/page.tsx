"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Kpis = { active_users: number; privileged_accounts: number; failed_logins: number; open_vulns: number; compliance_score: number };

export default function InfoSecDashboardPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [roleDist, setRoleDist] = useState<any[]>([]);
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [privChanges, setPrivChanges] = useState<any[]>([]);
  const [vulns, setVulns] = useState<any[]>([]);
  const [patch, setPatch] = useState<any[]>([]);
  const [dataProt, setDataProt] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [threats, setThreats] = useState<any[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [iamReqs, setIamReqs] = useState<any[]>([]);
  const [autoSec, setAutoSec] = useState<any[]>([]);
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
      fetch('/api/dashboard/infosec-kpis').then(j),
      fetch('/api/access/roles').then(j),
      fetch('/api/audit/login_activity').then(j),
      fetch('/api/audit/privilege_changes').then(j),
      fetch('/api/security/vulnerabilities').then(j),
      fetch('/api/security/patch_compliance').then(j),
      fetch('/api/security/data_protection').then(j),
      fetch('/api/security/incidents').then(j),
      fetch('/api/threat/intel').then(j),
      fetch('/api/compliance/frameworks').then(j),
      fetch('/api/audit/anomalies').then(j),
      fetch('/api/iam/requests').then(j),
      fetch('/api/automation/security').then(j),
    ]).then(([
      k,
      roles,
      logins,
      priv,
      vul,
      patch,
      dp,
      inc,
      thr,
      fr,
      an,
      iam,
      aut,
    ]) => {
      if (!alive) return;
      if (k) setKpis(k);
      if (roles) setRoleDist(roles);
      if (logins) setLoginActivity(logins);
      if (priv) setPrivChanges(priv);
      if (vul) setVulns(vul);
      if (patch) setPatch(patch);
      if (dp) setDataProt(dp);
      if (inc) setIncidents(inc);
      if (thr) setThreats(thr);
      if (fr) setFrameworks(fr);
      if (an) setAnomalies(an);
      if (iam) setIamReqs(iam);
      if (aut) setAutoSec(aut);
    });
    return () => { alive = false; };
  }, []);

  const accessOption = useMemo(() => {
    if (!roleDist || roleDist.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      grid: { left: 120, right: 16, top: 24, bottom: 24 },
      xAxis: { type: 'value', axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), formatter: (v: number) => formatK(v) }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'category', data: roleDist.map((r) => r.role), axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg) } },
      series: [{ type: 'bar', data: roleDist.map((r) => r.user_count) }],
    } as any;
  }, [roleDist, themeVersion]);

  const loginOption = useMemo(() => {
    if (!loginActivity || loginActivity.length === 0) return null as any;
    const dates = loginActivity.map((d) => d.date);
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
      series: [
        { name: 'Successful', type: 'line', showSymbol: false, lineStyle: { width: 1.5 }, data: loginActivity.map((d) => d.successful_logins) },
        { name: 'Failed', type: 'line', showSymbol: false, lineStyle: { width: 1.5 }, data: loginActivity.map((d) => d.failed_logins) },
      ],
    } as any;
  }, [loginActivity, themeVersion]);

  const privOption = useMemo(() => {
    if (!privChanges || privChanges.length === 0) return null as any;
    const dates = privChanges.map((d) => d.date);
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { bottom: 16, itemGap: 12, padding: [4, 0, 0, 0], textStyle: { color: cssVar('--muted-foreground', fg) } },
      grid: { left: 56, right: 16, top: 24, bottom: 56, containLabel: true },
      xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12 }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12, formatter: (v: number) => formatK(v) }, splitLine: { show: true, lineStyle: { color: border } } },
      series: [
        { name: 'Granted', type: 'bar', stack: 'total', data: privChanges.map((d) => d.privilege_granted) },
        { name: 'Revoked', type: 'bar', stack: 'total', data: privChanges.map((d) => d.privilege_revoked) },
      ],
    } as any;
  }, [privChanges, themeVersion]);

  const vulnOption = useMemo(() => {
    if (!vulns || vulns.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'item', formatter: '{b}: {c}', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { orient: 'vertical', right: 0, top: 'middle', itemGap: 10, textStyle: { color: cssVar('--muted-foreground', fg) } },
      series: [
        { type: 'pie', center: ['36%', '52%'], radius: ['46%', '70%'], itemStyle: { borderColor: card, borderWidth: 1 }, label: { show: true, color: fg, formatter: (p: any) => `${p.name} ${(p.percent||0).toFixed(0)}%` }, labelLine: { show: true, length: 8, length2: 8 }, labelLayout: { hideOverlap: true }, data: vulns.map((v) => ({ name: v.severity, value: v.count })) },
      ],
    } as any;
  }, [vulns, themeVersion]);

  const patchOption = useMemo(() => {
    if (!patch || patch.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    const primary = cssVar('--primary', '#6366f1');
    const muted = cssVar('--muted', '#eee');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      grid: { left: 56, right: 16, top: 24, bottom: 28 },
      xAxis: { type: 'category', data: patch.map((d) => d.date), axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg) }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: cssVar('--muted-foreground', fg) }, axisLine: { lineStyle: { color: border } }, splitLine: { show: true, lineStyle: { color: border } } },
      series: [{ type: 'line', showSymbol: false, lineStyle: { color: primary }, areaStyle: { color: muted, opacity: 0.25 }, data: patch.map((d) => d.compliance_rate) }],
    } as any;
  }, [patch, themeVersion]);

  const dataProtOption = useMemo(() => {
    if (!dataProt || dataProt.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      tooltip: { backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      radar: { indicator: dataProt.map((d) => ({ name: d.category, max: 100 })), axisName: { color: fg } },
      series: [{ type: 'radar', areaStyle: { opacity: 0.2 }, lineStyle: { color: cssVar('--primary', '#6366f1') }, data: [{ value: dataProt.map((d) => d.score), name: 'Coverage' }] }],
    } as any;
  }, [dataProt, themeVersion]);

  const autoSecOption = useMemo(() => {
    if (!autoSec || autoSec.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}%', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { orient: 'vertical', right: 0, top: 'middle', itemGap: 10, textStyle: { color: cssVar('--muted-foreground', fg), fontSize: 11 } },
      series: [{ type: 'pie', center: ['36%', '52%'], radius: ['46%', '70%'], selectedMode: false, hoverAnimation: false, emphasis: { disabled: true }, itemStyle: { borderColor: card, borderWidth: 1 }, label: { show: true, color: fg, formatter: (p: any) => `${p.name} ${(p.percent||0).toFixed(0)}%` }, labelLine: { show: true, length: 8, length2: 8 }, labelLayout: { hideOverlap: true }, data: autoSec.map((d) => ({ name: d.process_type, value: d.percentage })) }],
    } as any;
  }, [autoSec, themeVersion]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Information Security Administrator Dashboard</h1>
      <p className="mt-1 text-slate-600 text-sm">Security posture, compliance, and identity access monitoring.</p>

      {/* KPI row */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active Users" value={kpis?.active_users ?? '—'} color="blue" />
        <KpiCard label="Privileged Accounts" value={kpis?.privileged_accounts ?? '—'} color="purple" />
        <KpiCard label="Failed Logins (24h)" value={kpis?.failed_logins ?? '—'} color="red" />
        <KpiCard label="Open Vulnerabilities" value={kpis?.open_vulns ?? '—'} color="orange" />
        <KpiCard label="Compliance Score (%)" value={kpis?.compliance_score ?? '—'} color="green" />
        <KpiCard label="Automation (%)" value={autoSec?.find?.((x: any) => x.process_type === 'Automated')?.percentage ?? '—'} color="green" />
      </div>

      {/* Row 1 */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Access Control Summary</h2>
          <div className="mt-2 h-[200px]">
            {accessOption ? (
              // @ts-ignore
              <ReactECharts option={accessOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Login Activity (7 days)</h2>
          <div className="mt-2 h-[200px]">
            {loginOption ? (
              // @ts-ignore
              <ReactECharts option={loginOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Privileged Access Monitoring</h2>
          <div className="mt-2 h-[200px]">
            {privOption ? (
              // @ts-ignore
              <ReactECharts option={privOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Vulnerability Overview</h2>
          <div className="mt-2 h-[200px]">
            {vulnOption ? (
              // @ts-ignore
              <ReactECharts option={vulnOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Patch Compliance Trend</h2>
          <div className="mt-2 h-[200px]">
            {patchOption ? (
              // @ts-ignore
              <ReactECharts option={patchOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Data Protection & Encryption</h2>
          <div className="mt-2 h-[200px]">
            {dataProtOption ? (
              // @ts-ignore
              <ReactECharts option={dataProtOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: timeline + automation */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Security Incident Timeline</h2>
          <ul className="mt-2 space-y-2 h-64 overflow-auto pr-1">
            {incidents.map((i, idx) => (
              <li key={idx} className="rounded border border-[var(--border)] bg-white px-3 py-2">
                <div className="text-xs text-slate-500">{new Date(i.ts).toLocaleString()}</div>
                <div className="text-sm font-medium">{i.title}</div>
                <div className="text-xs text-slate-600">{i.status}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Security Automation Efficiency</h2>
          <div className="mt-2 h-[220px]">
            {autoSecOption ? (
              // @ts-ignore
              <ReactECharts option={autoSecOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Lists & Tables */}
      <div className="mt-4 grid gap-3 grid-cols-1 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Threat Intelligence Feed</h2>
          <div className="mt-2 h-64 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Threat Type</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Severity</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((t, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4">{t.date}</td>
                    <td className="py-2 pr-4">{t.threatType}</td>
                    <td className="py-2 pr-4">{t.source}</td>
                    <td className="py-2 pr-4">{t.severity}</td>
                    <td className="py-2 pr-4">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Compliance Frameworks</h2>
          <div className="mt-2 h-[200px]">
            {/* Simple bar using frameworks */}
            {frameworks.length > 0 ? (
              // @ts-ignore
              <ReactECharts
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: 40, right: 16, top: 24, bottom: 24 },
                  xAxis: { type: 'category', data: frameworks.map((f) => f.framework) },
                  yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
                  series: [{ type: 'bar', data: frameworks.map((f) => f.compliance_percentage) }],
                }}
                style={{ height: '100%', width: '100%' }}
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 grid-cols-1 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">User Activity Anomalies (24h)</h2>
          <div className="mt-2 h-64 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">User ID</th>
                  <th className="py-2 pr-4">Activity</th>
                  <th className="py-2 pr-4">Detected At</th>
                  <th className="py-2 pr-4">Risk Score</th>
                  <th className="py-2 pr-4">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((a, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4">{a.userId}</td>
                    <td className="py-2 pr-4">{a.activity}</td>
                    <td className="py-2 pr-4">{a.detectedAt}</td>
                    <td className="py-2 pr-4">{a.riskScore}</td>
                    <td className="py-2 pr-4">{a.actionTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Pending Access Requests</h2>
          <div className="mt-2 h-64 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Request ID</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Role Requested</th>
                  <th className="py-2 pr-4">Submitted At</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {iamReqs.map((r, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4">{r.requestId}</td>
                    <td className="py-2 pr-4">{r.user}</td>
                    <td className="py-2 pr-4">{r.roleRequested}</td>
                    <td className="py-2 pr-4">{r.submittedAt}</td>
                    <td className="py-2 pr-4">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
