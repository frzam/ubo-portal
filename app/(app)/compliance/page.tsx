import { readAudit } from '@/lib/audit';
import AuditTrailTable from '@/components/audit/AuditTrailTable';

export default async function CompliancePage() {
  const logs = await readAudit();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Compliance</h1>
      <p className="mt-2 text-slate-600">User login/logout audit trail.</p>

      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--card)] p-4">
        <AuditTrailTable logs={logs} pageSize={20} />
      </div>
    </div>
  );
}
