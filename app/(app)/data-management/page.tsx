export default function DataManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Data Management</h1>
      <p className="mt-2 text-slate-600">Ensures accurate and synchronized reference/master data.</p>

      <ul className="mt-4 grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 text-sm">
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Instrument Master</span><div className="text-slate-600">ISIN, CUSIP, Bloomberg mappings.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Counterparty Master</span><div className="text-slate-600">Brokers, custodians, fund houses.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Customer Master / KYC</span><div className="text-slate-600">FATCA/CRS, risk scoring.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Static Data Uploads</span><div className="text-slate-600">Batch imports for codes & identifiers.</div></li>
        <li className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"><span className="font-medium">Data Quality Reports</span><div className="text-slate-600">Missing fields, duplicates, validation errors.</div></li>
      </ul>
    </div>
  );
}

