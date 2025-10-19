"use client";

import { useEffect, useState } from 'react';

export default function BreachesPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch('/api/compliance/breaches').then((r)=>r.ok?r.json():[]).then(setRows).catch(()=>setRows([])); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Compliance Breaches</h1>
      <p className="mt-2 text-slate-600">View and manage breaches.</p>
      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="h-96 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Rule</th>
                <th className="py-1 pr-2">Fund</th>
                <th className="py-1 pr-2">Details</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Detected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r)=> (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{r.id}</td>
                  <td className="py-1 pr-2">{r.rule_id}</td>
                  <td className="py-1 pr-2">{r.fund}</td>
                  <td className="py-1 pr-2">{r.details}</td>
                  <td className="py-1 pr-2">{r.status}</td>
                  <td className="py-1 pr-2">{new Date(r.detected_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

