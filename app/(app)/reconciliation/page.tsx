"use client";

import { useEffect, useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const ReactECharts = nextDynamic(() => import("echarts-for-react"), { ssr: false });

const categories = [
  "Cash Reconciliation",
  "Position Reconciliation",
  "Trade Reconciliation",
  "NAV Component Reconciliation",
] as const;

type Category = (typeof categories)[number];

const filters = ["All", ...categories] as const;
type Filter = (typeof filters)[number];

const statusFilters = ["All", "Mismatched", "Pending", "Matched"] as const;
type StatusFilter = (typeof statusFilters)[number];

const sampleRows = Array.from({ length: 12 }).map((_, i) => ({
  id: `REC-${1000 + i}`,
  fund: ["Alpha Fund", "Beta Fund", "Delta Fund"][i % 3],
  category: categories[i % categories.length],
  source: "ETS",
  target: "Tadawul File",
  date: `2025-05-${(20 + (i % 10)).toString().padStart(2, '0')}`,
  variance: Number((((i * 137) % 5000) - 2500 + (((i * 29) % 100) / 100)).toFixed(2)),
  varianceType: ["Amount", "Quantity", "Missing", "Duplicate"][i % 4],
  ageing: [0, 1, 2, 3, 4][i % 5],
  status: (["Mismatched", "Pending", "Matched"] as const)[i % 3],
}));

export default function ReconciliationPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const nf = new Intl.NumberFormat("en-US");

  const summary = useMemo(() => {
    const total = sampleRows.length;
    const matched = sampleRows.filter((r) => r.status === "Matched").length;
    const mismatched = sampleRows.filter((r) => r.status === "Mismatched").length;
    const pending = sampleRows.filter((r) => r.status === "Pending").length;
    return [
      { label: "Total Records", value: total },
      { label: "Matched", value: matched },
      { label: "Mismatched", value: mismatched, color: "text-red-600" },
      { label: "Pending", value: pending },
    ];
  }, []);

  const trendOption = useMemo(() => ({
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 16, top: 24, bottom: 32 },
    xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri"], axisLine: { lineStyle: { color: "var(--border)" } } },
    yAxis: { type: "value", axisLine: { lineStyle: { color: "var(--border)" } } },
    series: [
      { name: "Total", type: "line", showSymbol: false, data: [310, 400, 360, 420, 480] },
      { name: "Mismatched", type: "line", showSymbol: false, data: [30, 28, 36, 25, 22] },
    ],
  }), []);

  const typePieOption = useMemo(() => ({
    tooltip: { trigger: "item" },
    series: [{ type: "pie", radius: ["50%", "70%"], data: [
      { name: "Amount", value: 54 },
      { name: "Quantity", value: 26 },
      { name: "Missing", value: 12 },
      { name: "Duplicate", value: 8 },
    ] }],
  }), []);

  const topBarOption = useMemo(() => ({
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 16, top: 24, bottom: 32 },
    xAxis: { type: "category", data: ["Alpha", "Beta", "Delta", "Gamma", "Kappa"], axisLine: { lineStyle: { color: "var(--border)" } } },
    yAxis: { type: "value", axisLine: { lineStyle: { color: "var(--border)" } } },
    series: [{ type: "bar", data: [32, 24, 18, 15, 9] }],
  }), []);

  // Set initial status filter from query (?status=Mismatched)
  const searchParams = useSearchParams();
  useEffect(() => {
    const s = searchParams.get("status");
    const allowed = ["All", "Mismatched", "Pending", "Matched"] as const;
    if (s && (allowed as readonly string[]).includes(s)) {
      setActiveStatus(s as StatusFilter);
    }
  }, [searchParams]);

  // Load roles to decide chart visibility
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const rs = Array.isArray(j?.roles) ? (j.roles as string[]) : [];
        setRoles(rs);
      })
      .catch(() => setRoles([]));
  }, []);

  const showCharts = useMemo(() => roles.includes('asset_manager') || roles.includes('admin'), [roles]);

  const filteredRows = useMemo(() => {
    let rows = sampleRows;
    if (activeFilter !== "All") rows = rows.filter((r) => r.category === activeFilter);
    if (activeStatus !== "All") rows = rows.filter((r) => r.status === activeStatus);
    if (dateFilter) rows = rows.filter((r) => r.date === dateFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.fund.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.target.toLowerCase().includes(q) ||
        r.varianceType.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [activeFilter, activeStatus, dateFilter, query]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Reconciliation Dashboard</h1>
      <p className="mt-2 text-[color:var(--muted-foreground)]">Quick view of reconciliation status: matched, pending, and mismatched.</p>

      {/* Summary tiles styled like Workflow cards */}
      <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((m, i) => {
          const total = summary[0]?.value || 1;
          const pct = Math.round(((m.value as number) / total) * 100);
          const barColor = m.label === 'Mismatched' ? 'bg-red-500' : m.label === 'Matched' ? 'bg-green-600' : 'bg-blue-500';
          const valueColor = m.label === 'Mismatched' ? 'text-red-600' : m.label === 'Matched' ? 'text-green-600' : '';
          return (
            <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="text-xs text-[color:var(--muted-foreground)]">{m.label}</div>
              <div className={`text-2xl font-semibold ${valueColor}`}>{nf.format(m.value)}</div>
              {m.label !== 'Total Records' && (
                <>
                  <div className="mt-1 text-[10px] text-[color:var(--muted-foreground)]">{pct}% of total</div>
                  <div className="mt-1 h-1.5 w-full bg-[var(--muted)] rounded">
                    <div className={`h-1.5 ${barColor} rounded`} style={{ width: `${pct}%` }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabs: Category */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)} className={`rounded border px-3 py-1 ${activeFilter === f ? "bg-[var(--muted)]" : ""}`}>{f}</button>
        ))}
      </div>
      {/* Filters: Status dropdown, Date, Text */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-xs text-[color:var(--muted-foreground)]">Status</span>
          <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value as StatusFilter)} className="rounded border px-2 py-1 bg-[var(--card)]">
            {statusFilters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs text-[color:var(--muted-foreground)]">Date</span>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded border px-2 py-1 bg-[var(--card)]" />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs text-[color:var(--muted-foreground)]">Data Filter</span>
          <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} className="rounded border px-2 py-1 bg-[var(--card)]" />
        </label>
      </div>

      {/* Table */}
      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-[var(--card)]">
              <tr className="text-left text-[color:var(--muted-foreground)]">
                <th className="py-2 px-3">Record ID</th>
                <th className="py-2 px-3">Fund Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Source System</th>
                <th className="py-2 px-3">Target System</th>
                <th className="py-2 px-3">Variance Amount</th>
                <th className="py-2 px-3">Variance Type</th>
                <th className="py-2 px-3">Ageing (Days)</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)] hover:bg-[var(--muted)] cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="py-1.5 px-3">{r.id}</td>
                  <td className="py-1.5 px-3">{r.fund}</td>
                  <td className="py-1.5 px-3">{r.category}</td>
                  <td className="py-1.5 px-3">{r.source}</td>
                  <td className="py-1.5 px-3">{r.target}</td>
                  <td className="py-1.5 px-3">{r.status === 'Matched' ? 'None' : nf.format(Number(r.variance))}</td>
                  <td className="py-1.5 px-3">{r.varianceType}</td>
                  <td className="py-1.5 px-3">{r.ageing}</td>
                  <td className={`py-1.5 px-3 ${r.status === 'Matched' ? 'text-green-600' : ''}`}>{r.status === 'Matched' ? 'Matched' : r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down panel */}
      {selected && (
        <div className="fixed inset-0 z-20 bg-black/30" onClick={() => setSelected(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-[var(--card)] border-l border-[var(--border)] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Details - {selected.id}</h3>
              <button onClick={() => setSelected(null)} className="rounded px-2 py-1 hover:bg-[var(--muted)]">Close</button>
            </div>
            <div className="mt-3 text-xs text-[color:var(--muted-foreground)]">Actions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="rounded border px-3 py-1 hover:bg-[var(--muted)]">Force Match</button>
              <button className="rounded border px-3 py-1 hover:bg-[var(--muted)]">Raise Query</button>
              <button className="rounded border px-3 py-1 hover:bg-[var(--muted)]">Approve Variance</button>
              <button className="rounded border px-3 py-1 hover:bg-[var(--muted)]">Write-off</button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded border border-[var(--border)] p-2">
                <div className="text-xs text-[color:var(--muted-foreground)]">Source ({selected.source})</div>
                <table className="mt-1 w-full text-sm">
                  <tbody>
                    <tr><td>Amount</td><td className="text-right">{nf.format(100000)}</td></tr>
                    <tr><td>Qty</td><td className="text-right">{nf.format(1000)}</td></tr>
                    <tr><td>Date</td><td className="text-right">2025-05-27</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded border border-[var(--border)] p-2">
                <div className="text-xs text-[color:var(--muted-foreground)]">Target ({selected.target})</div>
                <table className="mt-1 w-full text-sm">
                  <tbody>
                    <tr><td>Amount</td><td className="text-right text-red-600">{nf.format(101500)}</td></tr>
                    <tr><td>Qty</td><td className="text-right">{nf.format(1000)}</td></tr>
                    <tr><td>Date</td><td className="text-right">2025-05-27</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-xs text-[color:var(--muted-foreground)]">Reason & Action Trail</div>
              <ul className="mt-1 list-disc pl-5">
                <li>Variance identified by nightly process</li>
                <li>Pending justification from desk</li>
              </ul>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-xs text-[color:var(--muted-foreground)]">Attachments</div>
              <input type="file" className="mt-1 text-xs" />
            </div>
          </div>
        </div>
      )}

      {/* Charts (visible only for Asset Manager & Admin) */}
      {showCharts && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="text-sm font-medium">Daily Reconciliation Trend</div>
            <div className="mt-2 h-[200px]">
              {/* @ts-ignore */}
              <ReactECharts
                option={trendOption}
                onChartReady={(inst: any) => inst?.resize?.()}
                style={{ height: "100%", width: "100%", minHeight: 1, minWidth: 1 }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="text-sm font-medium">Top Funds by Mismatch Count</div>
            <div className="mt-2 h-[200px]">
              {/* @ts-ignore */}
              <ReactECharts
                option={topBarOption}
                onChartReady={(inst: any) => inst?.resize?.()}
                style={{ height: "100%", width: "100%", minHeight: 1, minWidth: 1 }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="text-sm font-medium">Mismatch Type Distribution</div>
            <div className="mt-2 h-[200px]">
              {/* @ts-ignore */}
              <ReactECharts
                option={typePieOption}
                onChartReady={(inst: any) => inst?.resize?.()}
                style={{ height: "100%", width: "100%", minHeight: 1, minWidth: 1 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


