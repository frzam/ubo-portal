"use client";

import { useEffect, useState } from 'react';

export default function TradesListPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch('/api/trades').then((r)=>r.ok?r.json():[]).then(setRows).catch(()=>setRows([])); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Trades</h1>
      <p className="mt-2 text-slate-600">All captured trades.</p>
      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="h-96 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Fund</th>
                <th className="py-1 pr-2">Symbol</th>
                <th className="py-1 pr-2">Side</th>
                <th className="py-1 pr-2">Qty</th>
                <th className="py-1 pr-2">Price</th>
                <th className="py-1 pr-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r)=> (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{r.id}</td>
                  <td className="py-1 pr-2">{r.fund}</td>
                  <td className="py-1 pr-2">{r.symbol}</td>
                  <td className="py-1 pr-2">{r.side}</td>
                  <td className="py-1 pr-2">{r.quantity}</td>
                  <td className="py-1 pr-2">{r.price}</td>
                  <td className="py-1 pr-2">{new Date(r.trade_date || r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

