"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Criteria = 'cif' | 'id_number' | 'un_number' | 'customer_name';
type Filters = { criterion: Criteria; value: string };

export default function ClientsPage() {
  // Observe theme toggles so charts can re-read CSS variables
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

  const cssVar = (name: string, fallback?: string) => {
    if (typeof window === 'undefined') return fallback || '';
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v?.trim() || fallback || '';
  };

  const formatK = (v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`);
  const [filters, setFilters] = useState<Filters>({ criterion: 'cif', value: '' });
  const [formError, setFormError] = useState<string>('');
  const [profile, setProfile] = useState<any | null>(null);
  const [kyc, setKyc] = useState<any[]>([]);
  const [assetsDist, setAssetsDist] = useState<any[]>([]);
  const [assetTrend, setAssetTrend] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [assetsSummary, setAssetsSummary] = useState<any[]>([]);
  const [txnSummary, setTxnSummary] = useState<any[]>([]);
  const [riskExposure, setRiskExposure] = useState<any[]>([]);
  const [liab, setLiab] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // formatting helpers for compact numeric/currency display
  const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const cf = (n: number, currency: string = 'SAR') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0);

  function qs() {
    const p = new URLSearchParams();
    if (filters.value) p.append(filters.criterion, filters.value);
    return p.toString() ? `?${p.toString()}` : '';
  }

  async function onSearch() {
    if (!filters.value.trim()) {
      setFormError('Please enter a value to search.');
      return;
    }
    setFormError('');
    setLoading(true);
    const j = (r: Response) => (r.ok ? r.json() : null);
    try {
      const q = qs();
      const [p, k, ad, at, h, ts, re, li, al, ih, dq, as] = await Promise.all([
        fetch(`/api/customer/profile${q}`).then(j),
        fetch(`/api/customer/kyc_status${q}`).then(j),
        fetch(`/api/customer/assets_distribution${q}`).then(j),
        fetch(`/api/customer/asset_trend${q}`).then(j),
        fetch(`/api/customer/holdings${q}`).then(j),
        fetch(`/api/customer/transactions_summary${q}`).then(j),
        fetch(`/api/customer/risk_exposure${q}`).then(j),
        fetch(`/api/customer/liabilities${q}`).then(j),
        fetch(`/api/customer/alerts${q}`).then(j),
        fetch(`/api/customer/interactions${q}`).then(j),
        fetch(`/api/customer/data_quality${q}`).then(j),
        fetch(`/api/customer/assets_summary${q}`).then(j),
      ]);
      if (p) setProfile(p);
      if (k) setKyc(k);
      if (ad) setAssetsDist(ad);
      if (at) setAssetTrend(at);
      if (h) setHoldings(h);
      if (ts) setTxnSummary(ts);
      if (re) setRiskExposure(re);
      if (li) setLiab(li);
      if (al) setAlerts(al);
      if (ih) setInteractions(ih);
      if (dq) setDataQuality(dq);
      if (as) setAssetsSummary(as);
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setFilters({ criterion: 'cif', value: '' });
    setProfile(null);
    setKyc([]);
    setAssetsDist([]);
    setAssetTrend([]);
    setHoldings([]);
    setTxnSummary([]);
    setRiskExposure([]);
    setLiab([]);
    setAlerts([]);
    setInteractions([]);
    setDataQuality(null);
  }

  // Chart options (only for asset distribution and asset trend)
  const assetsDistOption = useMemo(() => {
    if (!assetsDist || assetsDist.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    const palette = [
      cssVar('--chart-1', '#6366f1'),
      cssVar('--chart-2', '#8b5cf6'),
      cssVar('--chart-3', '#0ea5e9'),
      cssVar('--chart-4', '#22c55e'),
      cssVar('--chart-5', '#f59e0b'),
    ];
    return {
      backgroundColor: card,
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => `${p.name}: ${formatK(p.value)}`,
        backgroundColor: card,
        borderColor: border,
        textStyle: { color: fg },
      },
      legend: { bottom: 0, textStyle: { color: cssVar('--muted-foreground', fg) } },
      color: palette,
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          itemStyle: { borderRadius: 6, borderColor: card, borderWidth: 1 },
          selectedMode: false,
          hoverAnimation: false,
          emphasis: { disabled: true },
          label: { show: true, color: fg, formatter: (p: any) => `${p.name} ${formatK(p.value as number)}` },
          labelLine: { lineStyle: { color: border } },
          data: assetsDist.map((d: any) => ({ name: d.product, value: d.asset_value })),
        },
      ],
    } as any;
  }, [assetsDist, themeVersion]);

  // Derived KPIs from assetsSummary
  const assetsKpis = useMemo(() => {
    const totalMV = assetsSummary.reduce((s, r) => s + (Number(r.marketValue) || 0), 0);
    const totalBV = assetsSummary.reduce((s, r) => s + (Number(r.bookValue) || 0), 0);
    const gainLossPct = totalBV > 0 ? Math.round(((totalMV - totalBV) / totalBV) * 1000) / 10 : 0;
    const incomeYtd = assetsSummary.reduce((s, r) => s + (Number(r.incomeGeneratedYTD) || 0), 0);
    return { totalMV, totalBV, gainLossPct, incomeYtd };
  }, [assetsSummary]);

  const allocationByAssetOption = useMemo(() => {
    if (!assetsSummary || assetsSummary.length === 0) return null as any;
    const byType: Record<string, number> = {};
    for (const r of assetsSummary) {
      const t = r.assetType;
      const v = Number(r.marketValue) || 0;
      byType[t] = (byType[t] || 0) + v;
    }

    // Ensure a consolidated "Derivaties" category exists.
    // Merge any variants like "Derivative" / "Derivatives" into it.
    let derivVal = 0;
    for (const k of Object.keys(byType)) {
      if (/^deriv/i.test(k)) {
        derivVal += byType[k];
        delete byType[k];
      }
    }
    // Always include the category even if total is 0 so it's visible in the legend
    // Add fixed 15000 to Derivaties as requested
    byType['Derivaties'] = (byType['Derivaties'] || 0) + derivVal + 15000;

    const data = Object.entries(byType).map(([name, value]) => ({ name, value }));
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    return {
      backgroundColor: card,
      tooltip: { trigger: 'item', backgroundColor: card, borderColor: border, textStyle: { color: fg } },
      legend: { bottom: 0, itemGap: 10, itemWidth: 12, itemHeight: 8, textStyle: { color: fg } },
      series: [{
        type: 'pie',
        radius: ['46%', '70%'],
        data,
        itemStyle: { borderColor: card, borderWidth: 1 },
        label: { show: true, color: fg, formatter: (p: any) => `${p.name}` },
        labelLine: { show: true, lineStyle: { color: border } },
      }],
    } as any;
  }, [assetsSummary, themeVersion]);

  // Investment timeline (total asset value over time)
  const investmentTimelineOption = useMemo(() => {
    if (!assetTrend || assetTrend.length === 0) return null as any;
    const border = cssVar('--border', '#ddd');
    const card = cssVar('--card', '#fff');
    const fg = cssVar('--foreground', '#111');
    const muted = cssVar('--muted', '#eee');
    const primary = cssVar('--primary', '#6366f1');
    const data = assetTrend.map((d: any) => d.asset_value);
    const maxVal = Math.max(...data);
    const paddedMax = Math.ceil((maxVal * 1.1) / 10) * 10;
    return {
      backgroundColor: card,
      tooltip: { trigger: 'axis', backgroundColor: card, borderColor: border, textStyle: { color: fg }, valueFormatter: (v: any) => (typeof v === 'number' ? formatK(v) : v) },
      grid: { left: 64, right: 16, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: assetTrend.map((d: any) => d.date), axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), margin: 12 }, splitLine: { show: true, lineStyle: { color: border } } },
      yAxis: { type: 'value', max: paddedMax, axisLine: { lineStyle: { color: border } }, axisLabel: { color: cssVar('--muted-foreground', fg), formatter: (v: number) => formatK(v), margin: 10 }, splitLine: { show: true, lineStyle: { color: border } } },
      series: [{ type: 'line', showSymbol: false, emphasis: { disabled: true }, lineStyle: { width: 2, color: primary }, areaStyle: { opacity: 0.25, color: muted }, data }],
    } as any;
  }, [assetTrend, themeVersion]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Customer 360</h1>
      <p className="mt-1 text-slate-600 text-sm">Search and view a consolidated customer profile.</p>

      {/* Filters */}
      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
          <div className="w-full md:w-auto">
            <label className="block text-xs text-slate-600">Search By</label>
            <select
              className="mt-1 w-full md:w-auto max-w-[14rem] rounded border border-[var(--input)] px-2 py-1 text-sm"
              value={filters.criterion}
              onChange={(e) => setFilters({ ...filters, criterion: e.target.value as any })}
            >
              <option value="cif">CIF Number</option>
              <option value="id_number">ID Number (National/Resident)</option>
              <option value="un_number">UN Number</option>
              <option value="customer_name">Customer Name</option>
            </select>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs text-slate-600">Value</label>
            <input
              required
              aria-invalid={!!formError}
              className={
                'mt-1 w-full md:w-auto max-w-[16rem] rounded border px-2 py-1 text-sm ' +
                (formError ? 'border-red-500' : 'border-[var(--input)]')
              }
              value={filters.value}
              onChange={(e) => setFilters({ ...filters, value: e.target.value })}
              placeholder="Enter value"
            />
            {formError ? (
              <div className="mt-1 text-xs text-red-600">{formError}</div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button onClick={onSearch} disabled={loading || !filters.value.trim()} className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-[color:var(--primary-foreground)] disabled:opacity-50">Search</button>
            <button onClick={onClear} className="rounded border px-3 py-1.5 text-sm">Clear</button>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      {profile && (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Customer Information</h2>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 text-sm">
            <div><div className="text-xs text-slate-600">Customer Name</div><div className="font-medium">{profile.customer_name}</div></div>
            <div><div className="text-xs text-slate-600">CIF Number</div><div className="font-medium">{profile.cif}</div></div>
            <div><div className="text-xs text-slate-600">National ID / Iqama</div><div className="font-medium">{profile.id_number}</div></div>
            <div><div className="text-xs text-slate-600">Date of Birth</div><div className="font-medium">{profile.dob}</div></div>
            <div><div className="text-xs text-slate-600">Nationality</div><div className="font-medium">{profile.nationality}</div></div>
            <div><div className="text-xs text-slate-600">Customer Segment</div><div className="font-medium">{profile.segment}</div></div>
            <div><div className="text-xs text-slate-600">Relationship Manager</div><div className="font-medium">{profile.rm_name}</div></div>
            <div><div className="text-xs text-slate-600">Risk Rating</div><div className="font-medium">{profile.risk_rating}</div></div>
          </div>
        </div>
      )}

      {/* Charts row 1 (two charts side-by-side) */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Investment Timeline</h2>
          <div className="mt-2 h-[260px]">
            {investmentTimelineOption ? (
              // @ts-ignore
              <ReactECharts option={investmentTimelineOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Allocation by Asset Class</h2>
          <div className="mt-2 h-[260px]">
            {allocationByAssetOption ? (
              // @ts-ignore
              <ReactECharts option={allocationByAssetOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Data panels row (three compact tables) */}
      <div className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">KYC & Compliance Overview</h2>
          <div className="mt-2 h-56 overflow-auto">
            <table className="min-w-full table-auto text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--card)]"><tr className="text-left text-slate-600">
                  <th className="py-1 pr-2">Status Type</th>
                  <th className="py-1 pr-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {kyc.map((r, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2">{r.status_type}</td>
                    <td className="py-1 pr-2 text-right tabular-nums">{nf.format(r.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Transaction Behavior Overview</h2>
          <div className="mt-2 h-56 overflow-auto">
            <table className="min-w-full table-auto text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--card)]"><tr className="text-left text-slate-600">
                  <th className="py-1 pr-2">Month</th>
                  <th className="py-1 pr-2">Inflows</th>
                  <th className="py-1 pr-2">Outflows</th>
                </tr>
              </thead>
              <tbody>
                {txnSummary.map((r, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2">{r.month}</td>
                    <td className="py-1 pr-2">{nf.format(r.inflows)}</td>
                    <td className="py-1 pr-2">{nf.format(r.outflows)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Risk Exposure by Asset Class</h2>
          <div className="mt-2 h-56 overflow-auto">
            <table className="min-w-full table-auto text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--card)]"><tr className="text-left text-slate-600">
                  <th className="py-1 pr-2">Asset Class</th>
                  <th className="py-1 pr-2">Exposure Score</th>
                </tr>
              </thead>
              <tbody>
                {riskExposure.map((r, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2">{r.asset_class}</td>
                    <td className="py-1 pr-2">{nf.format(r.exposure_score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Customer Data Completeness removed as requested */}
      </div>

      {/* Holdings table + Liabilities */}
      <div className="mt-4 grid gap-3 grid-cols-1 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Detailed Product Holdings</h2>
          <div className="mt-2 h-64 overflow-auto">
            <table className="min-w-full table-auto text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--card)]"><tr className="text-left text-slate-600">
                  <th className="py-1 pr-2">Product Type</th>
                  <th className="py-1 pr-2">Account Number</th>
                  <th className="py-1 pr-2">Currency</th>
                  <th className="py-1 pr-2">Current Value</th>
                  <th className="py-1 pr-2">Last Transaction Date</th>
                  <th className="py-1 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((r, i) => (
                  <tr key={i} className="border-top border-[var(--border)]">
                    <td className="py-1 pr-2">{r.productType}</td>
                    <td className="py-1 pr-2">{r.accountNumber}</td>
                    <td className="py-1 pr-2">{r.currency}</td>
                    <td className="py-1 pr-2">{cf(r.currentValue, r.currency || 'SAR')}</td>
                    <td className="py-1 pr-2">{r.lastTxnDate}</td>
                    <td className="py-1 pr-2">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Liabilities and Credit Facilities</h2>
          <div className="mt-2 h-64 overflow-auto">
            <table className="min-w-full table-auto text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--card)]"><tr className="text-left text-slate-600">
                  <th className="py-1 pr-2">Facility Type</th>
                  <th className="py-1 pr-2">Outstanding Amount</th>
                </tr>
              </thead>
              <tbody>
                {liab.map((r, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2">{r.facility_type}</td>
                    <td className="py-1 pr-2">{cf(r.outstanding_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alerts and Interactions */}
      <div className="mt-4 grid gap-3 grid-cols-1 xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Recent Alerts & System Events</h2>
          <div className="mt-2 h-64 overflow-auto">
            <table className="min-w-full table-auto text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--card)]"><tr className="text-left text-slate-600">
                  <th className="py-1 pr-2">Date</th>
                  <th className="py-1 pr-2">Event Type</th>
                  <th className="py-1 pr-2">Description</th>
                  <th className="py-1 pr-2">Severity</th>
                  <th className="py-1 pr-2">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-1 pr-2">{a.date}</td>
                    <td className="py-1 pr-2">{a.eventType}</td>
                    <td className="py-1 pr-2">{a.description}</td>
                    <td className="py-1 pr-2">{a.severity}</td>
                    <td className="py-1 pr-2">{a.actionTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Relationship Interactions Timeline</h2>
          <ul className="mt-2 space-y-2 h-64 overflow-auto pr-1">
            {interactions.map((it, i) => (
              <li key={i} className="rounded border border-[var(--border)] bg-white px-3 py-2">
                <div className="text-xs text-slate-500">{new Date(it.ts).toLocaleString()}</div>
                <div className="text-sm font-medium">{it.type}</div>
                <div className="text-xs text-slate-600">{it.note}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}








function AssetsSummaryTable({ rows }: { rows: any[] }) {
  const [assetType, setAssetType] = useState<string>('All');
  const [custodian, setCustodian] = useState<string>('All');
  const [currency, setCurrency] = useState<string>('All');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
  const cf = (n: number, c: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'SAR', maximumFractionDigits: 0 }).format(n || 0);
  const filtered = rows.filter(r => (
    (assetType === 'All' || r.assetType === assetType) &&
    (custodian === 'All' || r.custodianName === custodian) &&
    (currency === 'All' || r.currency === currency) &&
    (!from || r.valuationDate >= from) && (!to || r.valuationDate <= to)
  ));
  const uniq = (a: string[]) => Array.from(new Set(a));
  const types = ['All', ...uniq(rows.map(r => r.assetType))];
  const custodians = ['All', ...uniq(rows.map(r => r.custodianName))];
  const currencies = ['All', ...uniq(rows.map(r => r.currency))];
  return (
    <div className="mt-2">
      <div className="mb-2 flex flex-wrap gap-2 text-xs">
        <label className="flex items-center gap-1">Asset Type
          <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className="ml-1 rounded border px-2 py-1 bg-[var(--card)]">
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">Custodian
          <select value={custodian} onChange={(e) => setCustodian(e.target.value)} className="ml-1 rounded border px-2 py-1 bg-[var(--card)]">
            {custodians.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="ml-1 rounded border px-2 py-1 bg-[var(--card)]">
            {currencies.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="ml-1 rounded border px-2 py-1 bg-[var(--card)]" />
        </label>
        <label className="flex items-center gap-1">To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="ml-1 rounded border px-2 py-1 bg-[var(--card)]" />
        </label>
      </div>
      <div className="overflow-auto">
        <table className="min-w-[1200px] text-xs">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-1 px-2">Customer</th>
              <th className="py-1 px-2">CIF</th>
              <th className="py-1 px-2">Asset ID</th>
              <th className="py-1 px-2">Asset Type</th>
              <th className="py-1 px-2">Product</th>
              <th className="py-1 px-2">ISIN</th>
              <th className="py-1 px-2">Account</th>
              <th className="py-1 px-2">Custodian</th>
              <th className="py-1 px-2 text-right">Units</th>
              <th className="py-1 px-2 text-right">Price</th>
              <th className="py-1 px-2 text-right">Market Value</th>
              <th className="py-1 px-2 text-right">Book Value</th>
              <th className="py-1 px-2 text-right">Unrealized G/L</th>
              <th className="py-1 px-2">Currency</th>
              <th className="py-1 px-2">Valuation Date</th>
              <th className="py-1 px-2">Last Txn Date</th>
              <th className="py-1 px-2">Risk</th>
              <th className="py-1 px-2">Liquidity</th>
              <th className="py-1 px-2 text-right">Income YTD</th>
              <th className="py-1 px-2">Status</th>
              <th className="py-1 px-2">Source</th>
              <th className="py-1 px-2">Updated By</th>
              <th className="py-1 px-2">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="py-1 px-2">{r.customerName}</td>
                <td className="py-1 px-2">{r.customerId}</td>
                <td className="py-1 px-2">{r.assetId}</td>
                <td className="py-1 px-2">{r.assetType}</td>
                <td className="py-1 px-2">{r.productName}</td>
                <td className="py-1 px-2">{r.isinCode ?? '—'}</td>
                <td className="py-1 px-2">{r.accountNumber}</td>
                <td className="py-1 px-2">{r.custodianName}</td>
                <td className="py-1 px-2 text-right tabular-nums">{r.unitsHeld != null ? nf.format(r.unitsHeld) : '—'}</td>
                <td className="py-1 px-2 text-right tabular-nums">{r.pricePerUnit != null ? nf.format(r.pricePerUnit) : '—'}</td>
                <td className="py-1 px-2 text-right tabular-nums">{cf(r.marketValue, r.currency)}</td>
                <td className="py-1 px-2 text-right tabular-nums">{cf(r.bookValue, r.currency)}</td>
                <td className={`py-1 px-2 text-right tabular-nums ${Number(r.unrealizedGainLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(Number(r.unrealizedGainLoss) >= 0 ? '+' : '') + nf.format(Number(r.unrealizedGainLoss))}</td>
                <td className="py-1 px-2">{r.currency}</td>
                <td className="py-1 px-2">{r.valuationDate}</td>
                <td className="py-1 px-2">{r.lastTransactionDate}</td>
                <td className="py-1 px-2">{r.riskCategory}</td>
                <td className="py-1 px-2">{r.liquidityStatus}</td>
                <td className="py-1 px-2 text-right tabular-nums">{cf(r.incomeGeneratedYTD, r.currency)}</td>
                <td className="py-1 px-2">{r.assetStatus}</td>
                <td className="py-1 px-2">{r.sourceSystem}</td>
                <td className="py-1 px-2">{r.lastUpdatedBy}</td>
                <td className="py-1 px-2">{r.lastUpdatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


