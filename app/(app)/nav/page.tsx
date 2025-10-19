export default function NavPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Fund Accounting & NAV</h1>
      <p className="mt-2 text-slate-600">Valuation, accounting, and fund administration.</p>

      <ul className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 text-sm">
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">NAV Calculation</span><div className="text-slate-600">Trigger, compute, validate NAV.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">NAV Review & Approval</span><div className="text-slate-600">Workflow-based approvals.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Accruals & Fees</span><div className="text-slate-600">Management/custody/performance fee setup.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Valuation Sources</span><div className="text-slate-600">Price validation from market feeds.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">GL & Ledger Posting</span><div className="text-slate-600">Integration with accounting systems.</div></li>
      </ul>
    </div>
  );
}

