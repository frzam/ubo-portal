"use client";

import { useEffect, useState } from 'react';

type Fund = { id: string; name: string };

export default function TradeCapturePage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [form, setForm] = useState<any>({ fund: '', symbol: '', side: 'Buy', quantity: 0, price: 0, trade_date: new Date().toISOString().slice(0,10) });
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => { fetch('/api/funds/list').then((r)=>r.ok?r.json():[]).then(setFunds).catch(()=>setFunds([])); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setInfo(null);
    const res = await fetch('/api/trades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await res.json().catch(()=>({}));
    if (res.ok) setInfo('Trade captured: ' + j.id); else setInfo(j?.error || 'Failed');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Trade Capture</h1>
      <p className="mt-2 text-slate-600">Book new trades (Maker).</p>

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 text-sm">
        <div>
          <label className="block text-xs text-slate-600">Fund</label>
          <select className="mt-1 w-full rounded border px-2 py-1" value={form.fund} onChange={(e)=>setForm({ ...form, fund: e.target.value })} required>
            <option value="">Select…</option>
            {funds.map((f)=> (<option key={f.id} value={f.id}>{f.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600">Symbol</label>
          <input className="mt-1 w-full rounded border px-2 py-1" value={form.symbol} onChange={(e)=>setForm({ ...form, symbol: e.target.value })} required />
        </div>
        <div>
          <label className="block text-xs text-slate-600">Side</label>
          <select className="mt-1 w-full rounded border px-2 py-1" value={form.side} onChange={(e)=>setForm({ ...form, side: e.target.value })}>
            <option>Buy</option>
            <option>Sell</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600">Quantity</label>
          <input type="number" className="mt-1 w-full rounded border px-2 py-1" value={form.quantity} onChange={(e)=>setForm({ ...form, quantity: Number(e.target.value) })} required />
        </div>
        <div>
          <label className="block text-xs text-slate-600">Price</label>
          <input type="number" step="0.0001" className="mt-1 w-full rounded border px-2 py-1" value={form.price} onChange={(e)=>setForm({ ...form, price: Number(e.target.value) })} required />
        </div>
        <div>
          <label className="block text-xs text-slate-600">Trade Date</label>
          <input type="date" className="mt-1 w-full rounded border px-2 py-1" value={form.trade_date} onChange={(e)=>setForm({ ...form, trade_date: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <button type="submit" className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-[color:var(--primary-foreground)]">Submit</button>
        </div>
      </form>
      {info && <div className="mt-3 text-xs text-slate-700">{info}</div>}
    </div>
  );
}

