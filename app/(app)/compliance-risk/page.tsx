"use client";

import { useEffect, useState } from 'react';

type AuditIssue = { auditPoint: string; severity: string; assignedTo: string; targetDate: string; status: string };
type AuditLog = { type: 'login' | 'logout'; username: string; timestamp: string; ip?: string; userAgent?: string };

export default function ComplianceRiskPage() {
  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    let alive = true;
    const j = (r: Response) => (r.ok ? r.json() : null);
    fetch('/api/audit/issues').then(j).then((data) => {
      if (!alive) return;
      if (Array.isArray(data)) setAuditIssues(data as AuditIssue[]);
    }).catch(() => {});

    fetch('/api/audit/logs').then(j).then((data) => {
      if (!alive) return;
      if (Array.isArray(data)) setAuditLogs(data as AuditLog[]);
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Compliance & Risk Management</h1>
      <p className="mt-2 text-slate-600">Monitoring adherence to regulatory, investment, and operational limits.</p>

      <ul className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 text-sm">
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Investment Limits</span><div className="text-slate-600">Issuer, sector, country, liquidity limits.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Breach Monitoring</span><div className="text-slate-600">View, approve, resolve limit breaches.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Regulatory Reporting</span><div className="text-slate-600">SAMA, CMA, FATCA, CRS, AML.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Risk Exposure Reports</span><div className="text-slate-600">VaR, asset class exposure.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Audit & Control Logs</span><div className="text-slate-600">Traceability of compliance actions.</div></li>
      </ul>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium text-[color:var(--foreground)]">Open Audit & Exception Items</h2>
        <div className="mt-2 h-64 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2 pr-4">Audit Point</th>
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Assigned To</th>
                <th className="py-2 pr-4">Target Date</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[color:var(--muted-foreground)]">No audit items</td>
                </tr>
              ) : (
                auditIssues.map((a, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4">{a.auditPoint}</td>
                    <td className="py-2 pr-4">{a.severity}</td>
                    <td className="py-2 pr-4">{a.assignedTo}</td>
                    <td className="py-2 pr-4">{a.targetDate}</td>
                    <td className="py-2 pr-4">{a.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-medium text-[color:var(--foreground)]">User Login/Logout Audit Trail</h2>
        <div className="mt-2 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--muted)] text-[color:var(--foreground)]">
              <tr>
                <th className="px-3 py-2 text-left">Timestamp</th>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">Event</th>
                <th className="px-3 py-2 text-left">IP</th>
                <th className="px-3 py-2 text-left">Agent</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-[color:var(--muted-foreground)]">No audit entries yet.</td>
                </tr>
              ) : (
                auditLogs.slice().reverse().map((e, idx) => (
                  <tr key={idx} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.username}</td>
                    <td className="px-3 py-2 whitespace-nowrap capitalize">{e.type}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.ip || '-'}</td>
                    <td className="px-3 py-2 truncate max-w-[320px]">{e.userAgent || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
