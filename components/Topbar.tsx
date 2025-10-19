'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Fund = { id: string; name: string };

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFund, setSelectedFund] = useState<string>('');
  const [bizDate, setBizDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [roles, setRoles] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');
  const [alerts, setAlerts] = useState<{ workflow: number; compliance: number; system: number }>({ workflow: 0, compliance: 0, system: 0 });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(t)) setMenuOpen(false);
      if (helpRef.current && !helpRef.current.contains(t)) setHelpOpen(false);
      if (quickRef.current && !quickRef.current.contains(t)) setQuickOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false); setHelpOpen(false); setQuickOpen(false); setNotifOpen(false);
      }
    }
    document.addEventListener('click', closeOnOutside);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('click', closeOnOutside); document.removeEventListener('keydown', onEsc); };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enableDark = stored ? stored === 'dark' : prefersDark;
    setIsDark(enableDark);
    document.documentElement.classList.toggle('dark', enableDark);
  }, []);

  useEffect(() => {
    fetch('/api/funds/list').then((r) => r.ok ? r.json() : []).then((j) => setFunds(Array.isArray(j) ? j : []));
    fetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((j) => { setRoles(j?.roles || []); setUsername(j?.username || ''); });
    Promise.all([
      fetch('/api/alerts/workflow').then((r) => r.ok ? r.json() : { count: 0 }),
      fetch('/api/alerts/compliance').then((r) => r.ok ? r.json() : { count: 0 }),
      fetch('/api/alerts/system').then((r) => r.ok ? r.json() : { count: 0 }),
    ]).then(([w,c,s]) => setAlerts({ workflow: w?.count || 0, compliance: c?.count || 0, system: s?.count || 0 })).catch(() => {});
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  async function onLogout() {
    try { setLoggingOut(true); await fetch('/api/auth/logout', { method: 'POST' }); } finally { window.location.href = '/login'; }
  }

  const isManager = roles.includes('asset_manager') || roles.includes('admin');

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]">
      {/* Top row: branding, search, actions */}
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2" aria-label="Go to dashboard">
            <Image src="/logo-ubo.png" alt="UBO" width={120} height={28} priority className="h-7 w-auto" />
            <span className="hidden md:block text-sm font-medium">Unified Back Office Portal</span>
          </Link>
        </div>

        <div className="flex-1 px-4 max-w-[640px]">
          <input
            placeholder="Search by CIF, Fund, Trade, Task, Document..."
            className="w-full rounded border border-[var(--input)] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Quick actions */}
          <div className="relative" ref={quickRef}>
            <button onClick={() => setQuickOpen((v) => !v)} className="rounded border px-3 py-1.5 text-sm hover:bg-[var(--muted)]">New ▾</button>
            {quickOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg">
                {(isManager ? ['New Trade', 'New Task', 'Upload File'] : ['New Task', 'Upload File']).map((label) => (
                  <button key={label} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--muted)]">{label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen((v) => !v)} className="relative rounded p-2 hover:bg-[var(--muted)]" aria-label="Notifications">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" /><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
              {alerts.workflow + (isManager ? alerts.compliance : 0) + alerts.system > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1 text-[10px] text-white">
                  {alerts.workflow + (isManager ? alerts.compliance : 0) + alerts.system}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 min-w-[220px] rounded-md border border-[var(--border)] bg-[var(--card)] py-2 shadow-lg text-sm">
                <div className="px-3 py-1">Workflow Alerts: {alerts.workflow}</div>
                {isManager && <div className="px-3 py-1">Compliance Alerts: {alerts.compliance}</div>}
                <div className="px-3 py-1">System Alerts: {alerts.system}</div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button aria-label="Toggle dark mode" onClick={toggleTheme} className="rounded p-2 hover:bg-[var(--muted)]" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[color:var(--muted-foreground)]"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[color:var(--muted-foreground)]"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            )}
          </button>

          {/* Help menu */}
          <div className="relative" ref={helpRef}>
            <button onClick={() => setHelpOpen((v) => !v)} className="rounded p-2 hover:bg-[var(--muted)]" aria-label="Help">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12" y2="17" /></svg>
            </button>
            {helpOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg text-sm">
                <Link href="/help/manual" className="block px-3 py-1 hover:bg-[var(--muted)]">User Manual</Link>
                <Link href="/support/new" className="block px-3 py-1 hover:bg-[var(--muted)]">Raise Ticket</Link>
                <Link href="/system/status" className="block px-3 py-1 hover:bg-[var(--muted)]">System Status</Link>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="h-8 w-8 rounded-full bg-[var(--primary)] text-[color:var(--primary-foreground)] grid place-items-center focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" title={username}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" /></svg>
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg text-sm">
                <div className="px-3 py-2 text-xs text-slate-600">{username}{roles.length ? ` • ${roles.join(', ')}` : ''}</div>
                <Link href="#" className="block px-3 py-1 hover:bg-[var(--muted)]">My Profile</Link>
                <Link href="#" className="block px-3 py-1 hover:bg-[var(--muted)]">Change Password</Link>
                <Link href="#" className="block px-3 py-1 hover:bg-[var(--muted)]">Switch Role</Link>
                <Link href="#" className="block px-3 py-1 hover:bg-[var(--muted)]">Language: EN/AR</Link>
                <button role="menuitem" onClick={onLogout} disabled={loggingOut} className="block w-full px-3 py-1 text-left hover:bg-[var(--muted)]">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second row: context selectors & system info */}
      <div className="border-t border-[var(--border)] px-4 py-2 text-xs text-[color:var(--foreground)] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Fund/Portfolio</span>
          <select value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)} className="rounded border border-[var(--input)] px-2 py-1">
            <option value="">All</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Business Date</span>
          <input type="date" value={bizDate} onChange={(e) => setBizDate(e.target.value)} className="rounded border border-[var(--input)] px-2 py-1" />
        </div>
        <div className="ml-auto text-slate-600">
          <span className="rounded px-1.5 py-[1px]" style={{ background: '#FFA500', color: '#1f2937' }}>UAT</span>
        </div>
      </div>
    </header>
  );
}
