"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type Task = {
  task_id: string;
  task_name: string;
  process_type: string;
  task_type: string;
  fund?: string;
  assigned_to: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold' | 'Rejected' | 'Queued' | 'Escalated';
  created_on: string;
  due_date: string;
  sla_remaining?: string;
  last_updated_by?: string;
  actions?: string[];
  source_system?: string;
};

export default function WorkflowPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [reassignTo, setReassignTo] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);
  const [openActionFor, setOpenActionFor] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState('');
  const [processType, setProcessType] = useState<string>('All');
  const [taskType, setTaskType] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [priority, setPriority] = useState<string>('All');
  const [assignee, setAssignee] = useState<string>('All');
  const [dueRange, setDueRange] = useState<string>('All');
  const [slaFlag, setSlaFlag] = useState<string>('All');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        setUsername(j?.username ?? null);
        setRoles(Array.isArray(j?.roles) ? j.roles : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/workflow/tasks')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Task[]) => setTasks(rows))
      .catch(() => setTasks([]));
  }, []);

  const isManager = useMemo(() => roles.includes('asset_manager') || roles.includes('admin'), [roles]);

  const visibleTasks = useMemo(() => {
    const mine = isManager ? tasks : tasks.filter((t) => !username || t.assigned_to === username);
    const now = new Date();
    return mine.filter((t) => {
      if (query && !t.task_name.toLowerCase().includes(query.toLowerCase())) return false;
      if (processType !== 'All' && t.process_type !== processType) return false;
      if (taskType !== 'All' && t.task_type !== taskType) return false;
      if (status !== 'All' && t.status !== (status as any)) return false;
      if (priority !== 'All' && t.priority !== (priority as any)) return false;
      if (assignee !== 'All' && t.assigned_to !== assignee) return false;
      if (dueRange !== 'All') {
        const due = new Date(t.due_date);
        const isOverdue = due < now && t.status !== 'Completed';
        const isToday = due.toDateString() === now.toDateString();
        if (dueRange === 'Overdue' && !isOverdue) return false;
        if (dueRange === 'Today' && !isToday) return false;
        if (dueRange === 'Upcoming' && (isOverdue || isToday)) return false;
      }
      if (slaFlag !== 'All') {
        const breach = (t.sla_remaining || '').startsWith('-');
        if (slaFlag === 'Yes' && !breach) return false;
        if (slaFlag === 'No' && breach) return false;
      }
      return true;
    });
  }, [tasks, isManager, username, query, processType, taskType, status, priority, assignee, dueRange, slaFlag]);

  const kpis = useMemo(() => {
    const totalPending = visibleTasks.filter((t) => t.status === 'Pending').length;
    const now = new Date();
    const overdue = visibleTasks.filter((t) => new Date(t.due_date) < now && t.status !== 'Completed').length;
    const completedToday = visibleTasks.filter((t) => t.status === 'Completed' && new Date(t.created_on).toDateString() === now.toDateString()).length;
    const breachRate = Math.round((visibleTasks.filter((t) => (t.sla_remaining || '').startsWith('-')).length / Math.max(visibleTasks.length, 1)) * 100);
    return { totalPending, overdue, completedToday, breachRate };
  }, [visibleTasks]);

  const byProcessOption = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of visibleTasks) counts[t.process_type] = (counts[t.process_type] || 0) + 1;
    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    if (data.length === 0) return null as any;
    return { tooltip: { trigger: 'item' }, series: [{ type: 'pie', radius: ['55%', '80%'], data }] } as any;
  }, [visibleTasks]);

  const byAssigneeOption = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of visibleTasks) counts[t.assigned_to] = (counts[t.assigned_to] || 0) + 1;
    const users = Object.keys(counts);
    if (users.length === 0) return null as any;
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: users },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: users.map((u) => counts[u]) }],
      grid: { left: 40, right: 16, top: 24, bottom: 40 },
    } as any;
  }, [visibleTasks]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Workflow & Task Management</h1>
      <p className="mt-2 text-slate-600">Manages operational processes and approvals.</p>
      {/* Quick links removed as requested */}

      {/* Filters & KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-3 xl:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-600">Process</label>
              <select value={processType} onChange={(e) => setProcessType(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs">
                <option>All</option>
                <option>Trade</option>
                <option>Fund Accounting</option>
                <option>Reconciliation</option>
                <option>Compliance</option>
                <option>Corporate Action</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Task Type</label>
              <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs">
                <option>All</option>
                <option>Approval</option>
                <option>Review</option>
                <option>Exception</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs">
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Queued</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs">
                <option>All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Assigned To</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs">
                <option>All</option>
                {Array.from(new Set(tasks.map((t) => t.assigned_to))).map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Due</label>
              <select value={dueRange} onChange={(e) => setDueRange(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs">
                <option>All</option>
                <option>Today</option>
                <option>Upcoming</option>
                <option>Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">SLA Breach</label>
              <select value={slaFlag} onChange={(e) => setSlaFlag(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs">
                <option>All</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Search</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="mt-1 w-full rounded border border-[var(--input)] px-2 py-1 text-xs" placeholder="Find a task" />
            </div>
          </div>
        </div>
        {(() => {
          const total = Math.max(visibleTasks.length, 1);
          const pct = (n: number) => Math.round((n / total) * 100);
          return (
            <>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="text-xs text-slate-600">Pending Tasks</div>
                <div className="text-2xl font-semibold">{kpis.totalPending}</div>
                <div className="mt-1 text-[10px] text-slate-600">{pct(kpis.totalPending)}% of open</div>
                <div className="mt-1 h-1.5 w-full bg-[var(--muted)] rounded">
                  <div className="h-1.5 bg-blue-500 rounded" style={{ width: `${pct(kpis.totalPending)}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="text-xs text-slate-600">Overdue Tasks</div>
                <div className="text-2xl font-semibold text-red-600">{kpis.overdue}</div>
                <div className="mt-1 text-[10px] text-slate-600">{pct(kpis.overdue)}% of all</div>
                <div className="mt-1 h-1.5 w-full bg-[var(--muted)] rounded">
                  <div className="h-1.5 bg-red-500 rounded" style={{ width: `${pct(kpis.overdue)}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="text-xs text-slate-600">Completed Today</div>
                <div className="text-2xl font-semibold text-green-600">{kpis.completedToday}</div>
                <div className="mt-1 text-[10px] text-slate-600">{pct(kpis.completedToday)}% of all</div>
                <div className="mt-1 h-1.5 w-full bg-[var(--muted)] rounded">
                  <div className="h-1.5 bg-green-600 rounded" style={{ width: `${pct(kpis.completedToday)}%` }} />
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Overview Metrics</h2>
          <div className="mt-2 h-[220px]">
            {(() => {
              const option = {
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: { bottom: 0 },
                series: [
                  {
                    type: 'pie',
                    radius: ['55%', '80%'],
                    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 1 },
                    data: [
                      { name: 'Pending', value: kpis.totalPending },
                      { name: 'Overdue', value: kpis.overdue },
                      { name: 'Completed Today', value: kpis.completedToday },
                    ],
                  },
                ],
              } as any;
              // @ts-ignore
              return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
            })()}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Tasks by Process</h2>
          <div className="mt-2 h-[220px]">
            {byProcessOption ? (
              // @ts-ignore
              <ReactECharts option={byProcessOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">Tasks by Assignee</h2>
          <div className="mt-2 h-[220px]">
            {byAssigneeOption ? (
              // @ts-ignore
              <ReactECharts option={byAssigneeOption} style={{ height: '100%', width: '100%' }} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[color:var(--muted-foreground)]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks table */}
      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[color:var(--foreground)]">My Pending Tasks</h2>
          <div className="text-xs text-slate-600">{visibleTasks.length} items</div>
        </div>
        <div className="mt-2 h-72 overflow-auto">
          <table className="min-w-full table-auto text-xs">
            <thead className="sticky top-0 z-10 bg-[var(--card)]">
              <tr className="text-left text-slate-600">
                <th className="py-1 pr-2">Task ID</th>
                <th className="py-1 pr-2">Task Name</th>
                <th className="py-1 pr-2">Process</th>
                <th className="py-1 pr-2">Type</th>
                <th className="py-1 pr-2">Fund</th>
                <th className="py-1 pr-2">Assigned To</th>
                <th className="py-1 pr-2">Priority</th>
                <th className="py-1 pr-2">Created</th>
                <th className="py-1 pr-2">Due</th>
                <th className="py-1 pr-2">SLA</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((w, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="py-1 pr-2">{w.task_id}</td>
                  <td className="py-1 pr-2">{w.task_name}</td>
                  <td className="py-1 pr-2">{w.process_type}</td>
                  <td className="py-1 pr-2">{w.task_type}</td>
                  <td className="py-1 pr-2">{w.fund || '-'}</td>
                  <td className="py-1 pr-2">{w.assigned_to}</td>
                  <td className="py-1 pr-2">
                    <span className={
                      'rounded px-2 py-[2px] text-[10px] ' +
                      (w.priority === 'High'
                        ? 'bg-red-100 text-red-700'
                        : w.priority === 'Medium'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700')
                    }>
                      {w.priority}
                    </span>
                  </td>
                  <td className="py-1 pr-2">{new Date(w.created_on).toLocaleString()}</td>
                  <td className="py-1 pr-2">{new Date(w.due_date).toLocaleString()}</td>
                  <td className={"py-1 pr-2 " + ((w.sla_remaining || '').startsWith('-') ? 'text-red-600' : 'text-slate-700')}>{w.sla_remaining || '-'}</td>
                  <td className="py-1 pr-2">{w.status}</td>
                  <td className="py-1 pr-2">
                    <div className="relative inline-block">
                      <button
                        className="rounded border px-2 py-1 text-xs hover:bg-[var(--muted)]"
                        onClick={() => setOpenActionFor(openActionFor === w.task_id ? null : w.task_id)}
                        aria-haspopup="menu"
                        aria-expanded={openActionFor === w.task_id}
                      >
                        Actions ▾
                      </button>
                      {openActionFor === w.task_id && (
                        <div
                          role="menu"
                          className="absolute z-10 mt-1 min-w-[140px] rounded border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
                        >
                          <button
                            role="menuitem"
                            className="block w-full px-3 py-1 text-left text-xs hover:bg-[var(--muted)]"
                            onClick={() => setOpenActionFor(null)}
                          >
                            View Details
                          </button>
                          {isManager && (
                            <>
                              <button
                                role="menuitem"
                                className="block w-full px-3 py-1 text-left text-xs hover:bg-[var(--muted)]"
                                onClick={() => setOpenActionFor(null)}
                              >
                                Approve
                              </button>
                              <button
                                role="menuitem"
                                className="block w-full px-3 py-1 text-left text-xs hover:bg-[var(--muted)]"
                                onClick={() => setOpenActionFor(null)}
                              >
                                Reject
                              </button>
                              <button
                                role="menuitem"
                                className="block w-full px-3 py-1 text-left text-xs hover:bg-[var(--muted)]"
                                onClick={() => {
                                  setOpenActionFor(null);
                                  setReassignId(w.task_id);
                                  setReassignTo(w.assigned_to);
                                }}
                              >
                                Reassign…
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isManager && reassignId && (
        <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Reassign Task</h3>
            <button className="text-xs underline" onClick={() => setReassignId(null)}>Close</button>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
            <div>
              <label className="block text-xs text-slate-600">Task ID</label>
              <div className="mt-1 text-slate-800">{reassignId}</div>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Assign To</label>
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="mt-1 rounded border border-[var(--input)] px-2 py-1 text-sm"
              >
                {Array.from(new Set(tasks.map((t) => t.assigned_to))).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto">
              <button
                onClick={async () => {
                  try {
                    setReassigning(true);
                    const res = await fetch('/api/workflow/reassign', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ task_id: reassignId, assignee: reassignTo }),
                    });
                    if (res.ok) {
                      setTasks((prev) => prev.map((t) => (t.task_id === reassignId ? { ...t, assigned_to: reassignTo } : t)));
                      setReassignId(null);
                    }
                  } finally {
                    setReassigning(false);
                  }
                }}
                disabled={reassigning}
                className="rounded bg-[var(--primary)] px-3 py-1.5 text-sm text-[color:var(--primary-foreground)] disabled:opacity-50"
              >
                {reassigning ? 'Reassigning…' : 'Confirm Reassign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helpful links removed as requested */}
    </div>
  );
}
