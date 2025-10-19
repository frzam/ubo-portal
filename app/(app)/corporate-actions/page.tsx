export default function CorporateActionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Corporate Actions</h1>
      <p className="mt-2 text-slate-600">Corporate event handling and income processing.</p>

      <ul className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 text-sm">
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Event Calendar</span><div className="text-slate-600">Upcoming dividend, bonus, split, merger events.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Entitlement Processing</span><div className="text-slate-600">Record and verify income.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Tax & Withholding Summary</span><div className="text-slate-600">FATCA, WHT management.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Event Approval Workflow</span><div className="text-slate-600">Maker-checker approval.</div></li>
      </ul>
    </div>
  );
}

