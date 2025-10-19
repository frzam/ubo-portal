"use client";

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Criteria = 'cif' | 'id_number' | 'un_number' | 'customer_name';
type Filters = { criterion: Criteria; value: string };

export default function ClientsPage() {
  const [filters, setFilters] = useState<Filters>({ criterion: 'cif', value: '' });
  const [formError, setFormError] = useState<string>('');
  const [profile, setProfile] = useState<any | null>(null);
  const [kyc, setKyc] = useState<any[]>([]);
  const [assetsDist, setAssetsDist] = useState<any[]>([]);
  const [assetTrend, setAssetTrend] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);
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
      const [p, k, ad, at, h, ts, re, li, al, ih, dq] = await Promise.all([
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
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 1 },
          data: assetsDist.map((d: any) => ({ name: d.product, value: d.asset_value })),
        },
      ],
    } as any;
  }, [assetsDist]);

  const assetTrendOption = useMemo(() => {
    if (!assetTrend || assetTrend.length === 0) return null as any;
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 24, bottom: 28 },
      xAxis: { type: 'category', data: assetTrend.map((d: any) => d.date) },
      yAxis: { type: 'value' },
      series: [
        { type: 'line', showSymbol: false, areaStyle: { opacity: 0.15 }, data: assetTrend.map((d: any) => d.asset_value) },
      ],
    } as any;
  }, [assetTrend]);

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
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Asset Distribution</h2>
          <div className="mt-2 h-[260px]">
            {assetsDistOption ? (
              // @ts-ignore
              <ReactECharts option={assetsDistOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Total Asset Value Over Time</h2>
          <div className="mt-2 h-[260px]">
            {assetTrendOption ? (
              // @ts-ignore
              <ReactECharts option={assetTrendOption} style={{ height: '100%', width: '100%' }} />
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






