export default function ComplianceRiskPage() {
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
    </div>
  );
}

