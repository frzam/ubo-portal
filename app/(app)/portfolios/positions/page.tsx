"use client";

import { useEffect, useState } from 'react';

type Fund = { id: string; name: string };

export default function PositionsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [fund, setFund] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => { fetch('/api/funds/list').then((r)=>r.ok?r.json():[]).then(setFunds).catch(()=>setFunds([])); }, []);
  useEffect(() => { if (fund) fetch(`/api/positions/${fund}`).then((r)=>r.ok?r.json():[]).then(setRows).catch(()=>setRows([])); }, [fund]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Positions</h1>
      <p className="mt-2 text-slate-600">Aggregated positions by fund/portfolio.</p>

      <div className="mt-4 flex items-end gap-3">
        <div>
          <label className="block text-xs text-slate-600">Fund</label>
          <select className="mt-1 rounded border px-2 py-1 text-sm" value={fund} onChange={(e)=>setFund(e.target.value)}>
            <option value="">Select…</option>
            {funds.map((f)=> (<option key={f.id} value={f.id}>{f.name}</option>))}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="h-96 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">Symbol</th>
                <th className="py-1 pr-2">Quantity</th>
                <th className="py-1 pr-2">Avg Price</th>
                <th className="py-1 pr-2">Market Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r)=> (
                <tr key={r.symbol} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{r.symbol}</td>
                  <td className="py-1 pr-2">{r.quantity}</td>
                  <td className="py-1 pr-2">{r.avg_price?.toFixed?.(2) ?? '-'}</td>
                  <td className="py-1 pr-2">{r.market_value?.toFixed?.(2) ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

