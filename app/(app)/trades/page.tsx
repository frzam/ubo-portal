export default function TradesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Trade & Settlement Management</h1>
      <p className="mt-2 text-slate-600">Core post-trade lifecycle management.</p>

      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 text-sm">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="font-medium">Trade Capture</h2>
          <p className="text-slate-600 mt-1">Upload or book new trades.</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="font-medium">Trade Matching</h2>
          <p className="text-slate-600 mt-1">Match internal vs custodian/broker confirmations.</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="font-medium">Trade Settlement</h2>
          <p className="text-slate-600 mt-1">Approve, confirm, or reject settlements.</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="font-medium">Trade Exceptions</h2>
          <p className="text-slate-600 mt-1">Break resolution and comments.</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="font-medium">Counterparty Exposure</h2>
          <p className="text-slate-600 mt-1">Limits, breaches, risk distribution.</p>
        </div>
      </div>
    </div>
  );
}

