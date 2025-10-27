'use client';

import { useMemo, useState } from 'react';

export type AuditLog = {
  type: 'login' | 'logout';
  username: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
};

export default function AuditTrailTable({ logs, pageSize = 20 }: { logs: AuditLog[]; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const total = logs?.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageRows = useMemo(() => logs.slice().reverse().slice(start, end), [logs, start, end]);

  return (
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
          {total === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-[color:var(--muted-foreground)]">No audit entries yet.</td>
            </tr>
          ) : (
            pageRows.map((e, idx) => (
              <tr key={`${e.timestamp}-${idx}`} className="border-t border-[var(--border)]">
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
      <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
        <div>
          {total > 0 ? `Showing ${start + 1}–${end} of ${total}` : 'No records'}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Prev
          </button>
          <span>
            Page {safePage} / {totalPages}
          </span>
          <button
            className="rounded border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

