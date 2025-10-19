"use client";

import { useEffect, useState } from 'react';

type Instrument = { id: string; symbol: string; name: string; product_type?: string; currency?: string };

export default function InstrumentsPage() {
  const [rows, setRows] = useState<Instrument[]>([]);
  const [form, setForm] = useState<Instrument>({ id: '', symbol: '', name: '', product_type: 'Equity', currency: 'SAR' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/instruments').then((r) => (r.ok ? r.json() : [])).then(setRows).catch(() => setRows([]));
  }, []);

  async function onAdd() {
    setSaving(true);
    try {
      const res = await fetch('/api/instruments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) {
        setRows((prev) => [...prev, form]);
        setForm({ id: '', symbol: '', name: '', product_type: 'Equity', currency: 'SAR' });
      }
    } finally { setSaving(false); }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Instrument Master</h1>
      <p className="mt-2 text-slate-600">Manage instruments/securities reference data.</p>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium">Add Instrument</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-5 text-sm">
          <input placeholder="ID" className="rounded border px-2 py-1" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
          <input placeholder="Symbol" className="rounded border px-2 py-1" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
          <input placeholder="Name" className="rounded border px-2 py-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded border px-2 py-1" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })}>
            {['Equity','ETF','MutualFund','Bond','Sukuk','MM','OTC','SBL','Structured','Derivative'].map((p) => (<option key={p}>{p}</option>))}
          </select>
          <input placeholder="Currency" className="rounded border px-2 py-1" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        </div>
        <div className="mt-2">
          <button disabled={saving} onClick={onAdd} className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-[color:var(--primary-foreground)] disabled:opacity-50">{saving ? 'Saving…' : 'Add'}</button>
        </div>
      </div>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium">Instruments</h2>
        <div className="mt-2 h-80 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Symbol</th>
                <th className="py-1 pr-2">Name</th>
                <th className="py-1 pr-2">Type</th>
                <th className="py-1 pr-2">Currency</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{r.id}</td>
                  <td className="py-1 pr-2">{r.symbol}</td>
                  <td className="py-1 pr-2">{r.name}</td>
                  <td className="py-1 pr-2">{r.product_type || '-'}</td>
                  <td className="py-1 pr-2">{r.currency || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

