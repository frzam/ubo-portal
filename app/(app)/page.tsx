import { PieCard } from '@/components/charts/PieCard';
import { BarCard } from '@/components/charts/BarCard';
import { TimelineCard } from '@/components/charts/TimelineCard';

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome to the Unified Back Office Portal.
      </p>

      <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-medium">AUM</h2>
          <p className="text-3xl mt-2">$12.4B</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-medium">Active Portfolios</h2>
          <p className="text-3xl mt-2">128</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-medium">Open Compliance Tasks</h2>
          <p className="text-3xl mt-2">23</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <PieCard />
        <BarCard />
        <TimelineCard />
      </div>
    </div>
  );
}
