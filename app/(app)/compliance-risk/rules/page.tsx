"use client";

import { useEffect, useState } from 'react';

type Rule = { id: string; name: string; type?: string; params?: any };

export default function RulesPage() {
  const [rows, setRows] = useState<Rule[]>([]);
  const [form, setForm] = useState<Rule>({ id: '', name: '', type: 'Limit', params: { issuer_pct: 10 } });
  const [saving, setSaving] = useState(false);

  async function load() { const r = await fetch('/api/compliance/rules'); const j = await r.json(); setRows(Array.isArray(j)? j:[]); }
  useEffect(() => { load(); }, []);

  async function onAdd() {
    setSaving(true);
    try {
      await fetch('/api/compliance/rules', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      await load();
      setForm({ id: '', name: '', type: 'Limit', params: { issuer_pct: 10 } });
    } finally { setSaving(false); }
  }

  async function remove(id: string) { await fetch(`/api/compliance/rules/${id}`, { method: 'DELETE' }); load(); }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Compliance Rules</h1>
      <p className="mt-2 text-slate-600">Define investment limits and checks.</p>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium">Add Rule</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-4 text-sm">
          <input placeholder="ID" className="rounded border px-2 py-1" value={form.id} onChange={(e)=>setForm({...form, id:e.target.value})} />
          <input placeholder="Name" className="rounded border px-2 py-1" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
          <select className="rounded border px-2 py-1" value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})}>
            {['Limit','Watchlist','Country','Sector','Liquidity'].map((t)=>(<option key={t}>{t}</option>))}
          </select>
          <input placeholder="Params (JSON)" className="rounded border px-2 py-1" value={JSON.stringify(form.params)} onChange={(e)=>{
            try { setForm({...form, params: JSON.parse(e.target.value || '{}')}); } catch {}
          }} />
        </div>
        <div className="mt-2">
          <button disabled={saving} onClick={onAdd} className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-[color:var(--primary-foreground)] disabled:opacity-50">{saving?'Saving…':'Add'}</button>
        </div>
      </div>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium">Rules</h2>
        <div className="mt-2 h-80 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Name</th>
                <th className="py-1 pr-2">Type</th>
                <th className="py-1 pr-2">Params</th>
                <th className="py-1 pr-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r)=> (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{r.id}</td>
                  <td className="py-1 pr-2">{r.name}</td>
                  <td className="py-1 pr-2">{r.type}</td>
                  <td className="py-1 pr-2">{JSON.stringify(r.params)}</td>
                  <td className="py-1 pr-2"><button className="rounded border px-2 py-1" onClick={()=>remove(r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

