'use client';

export function KpiCard({ label, value, color }: { label: string; value: string | number; color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal' }) {
  const colorClass =
    color === 'green' ? 'text-green-600'
    : color === 'red' ? 'text-red-600'
    : color === 'orange' ? 'text-orange-600'
    : color === 'purple' ? 'text-purple-600'
    : color === 'teal' ? 'text-teal-600'
    : 'text-blue-600';
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
      <div className="text-xs text-slate-600">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${colorClass}`}>{value}</div>
    </div>
  );
}
