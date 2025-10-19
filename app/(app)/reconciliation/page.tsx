export default function ReconciliationPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Reconciliation</h1>
      <p className="mt-2 text-slate-600">Ensures consistency between books of record.</p>

      <ul className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 text-sm">
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Cash Reconciliation</span><div className="text-slate-600">Bank balances vs internal ledger.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Position Reconciliation</span><div className="text-slate-600">Securities and holdings by custodian.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">NAV Reconciliation</span><div className="text-slate-600">Internal vs Administrator NAVs.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Exception Management</span><div className="text-slate-600">Break identification & closure tracking.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Audit Trail</span><div className="text-slate-600">Action logs for reconciliations.</div></li>
      </ul>
    </div>
  );
}

