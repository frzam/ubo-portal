"use client";

import { useEffect, useState } from 'react';

type Fund = { id: string; name: string };
type Run = { id: string; fund: string; date: string; status: string; created_at: string; checks?: { name: string; status: string }[] };

export default function NavRunPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [form, setForm] = useState({ fund: '', date: new Date().toISOString().slice(0,10) });
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch('/api/nav/run'); const j = await r.json(); setRuns(Array.isArray(j)? j.reverse():[]);
  }
  useEffect(() => { fetch('/api/funds/list').then((r)=>r.ok?r.json():[]).then(setFunds); load(); }, []);

  async function startRun() {
    setBusy(true); try { await fetch('/api/nav/run', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }); await load(); } finally { setBusy(false); }
  }
  async function validate(id: string) {
    await fetch('/api/nav/validate', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) }); await load();
  }
  async function signoff(id: string) {
    await fetch('/api/nav/signoff', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) }); await load();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">NAV Run</h1>
      <p className="mt-2 text-slate-600">Trigger, validate, and sign off NAV runs.</p>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-600">Fund</label>
            <select className="mt-1 w-full rounded border px-2 py-1" value={form.fund} onChange={(e)=>setForm({...form, fund:e.target.value})}>
              <option value="">Select…</option>
              {funds.map((f)=> (<option key={f.id} value={f.id}>{f.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">Date</label>
            <input type="date" className="mt-1 w-full rounded border px-2 py-1" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} />
          </div>
          <div className="flex items-end">
            <button disabled={busy || !form.fund} onClick={startRun} className="rounded bg-[var(--primary)] px-3 py-1.5 text-[color:var(--primary-foreground)] disabled:opacity-50">{busy?'Starting…':'Start Run'}</button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="h-96 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Fund</th>
                <th className="py-1 pr-2">Date</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Checks</th>
                <th className="py-1 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r)=> (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{r.id}</td>
                  <td className="py-1 pr-2">{r.fund}</td>
                  <td className="py-1 pr-2">{r.date}</td>
                  <td className="py-1 pr-2">{r.status}</td>
                  <td className="py-1 pr-2">{r.checks?.map((c)=> `${c.name}:${c.status}`).join(', ')|| '-'}</td>
                  <td className="py-1 pr-2">
                    <div className="flex gap-2">
                      <button className="rounded border px-2 py-1" onClick={()=>validate(r.id)}>Validate</button>
                      <button className="rounded border px-2 py-1" onClick={()=>signoff(r.id)} disabled={r.status!=='Validated'}>Sign Off</button>
                    </div>
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

