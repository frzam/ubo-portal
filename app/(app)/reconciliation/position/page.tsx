"use client";

import { useEffect, useState } from 'react';

export default function PositionReconPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await fetch('/api/recon/position'); const j = await r.json(); setRows(Array.isArray(j) ? j : []); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function closeException(id: string) {
    await fetch('/api/recon/position', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Position Reconciliation</h1>
      <p className="mt-2 text-slate-600">Securities and holdings by custodian vs book.</p>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between text-sm">
          <div>Items: {rows.length} • Exceptions: {rows.filter((x)=>!x.matched).length}</div>
          <button className="rounded border px-2 py-1 text-xs" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
        <div className="mt-2 h-96 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Fund</th>
                <th className="py-1 pr-2">Symbol</th>
                <th className="py-1 pr-2">Date</th>
                <th className="py-1 pr-2">Custodian Qty</th>
                <th className="py-1 pr-2">Book Qty</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r)=> (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{r.id}</td>
                  <td className="py-1 pr-2">{r.fund}</td>
                  <td className="py-1 pr-2">{r.symbol}</td>
                  <td className="py-1 pr-2">{r.date}</td>
                  <td className="py-1 pr-2">{r.custodian_qty}</td>
                  <td className="py-1 pr-2">{r.book_qty}</td>
                  <td className={"py-1 pr-2 " + (r.matched ? 'text-green-600' : 'text-red-600')}>{r.matched ? 'Matched' : `Exception: ${r.reason}`}</td>
                  <td className="py-1 pr-2">
                    {!r.matched ? (
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => closeException(r.id)}>Close</button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

