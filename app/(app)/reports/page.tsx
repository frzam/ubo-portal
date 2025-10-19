export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Reporting & Analytics</h1>
      <p className="mt-2 text-slate-600">Internal, regulatory, and client-level insights.</p>

      <ul className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 text-sm">
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Standard Reports</span><div className="text-slate-600">NAV summary, exposure, reconciliation.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Regulatory Reports</span><div className="text-slate-600">CMA filings, FATCA, CRS, PDPL compliance.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Custom Reports</span><div className="text-slate-600">Ad-hoc data extraction.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">MIS Dashboard</span><div className="text-slate-600">Management-level KPIs.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Export Options</span><div className="text-slate-600">Excel, PDF, CSV, or SFTP.</div></li>
      </ul>
    </div>
  );
}

