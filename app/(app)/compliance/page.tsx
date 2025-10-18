import { readAudit } from '@/lib/audit';

export default async function CompliancePage() {
  const logs = await readAudit();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Compliance</h1>
      <p className="mt-2 text-slate-600">User login/logout audit trail.</p>

      <div className="mt-4 overflow-auto rounded border border-[var(--border)] bg-[var(--card)]">
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
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-[color:var(--muted-foreground)]">
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              logs
                .slice()
                .reverse()
                .map((e, idx) => (
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
  );
}
