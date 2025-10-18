'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Dashboard', icon: 'home' },
  { href: '/clients', label: 'Clients', icon: 'people' },
  { href: '/portfolios', label: 'Portfolios', icon: 'briefcase' },
  { href: '/compliance', label: 'Compliance', icon: 'shield-check' },
  { href: '/settings', label: 'Settings', icon: 'gear' },
] as const;

function Icon({ name }: { name: typeof links[number]['icon'] }) {
  const cls = 'h-5 w-5';
  switch (name) {
    case 'home':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </svg>
      );
    case 'people':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
          <path d="M2 20a7 7 0 0110-3 7 7 0 0110 3" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 6h4V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v2z" />
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M3 12h18" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'gear':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="2" y1="14" x2="6" y2="14" />
          <line x1="10" y1="8" x2="14" y2="8" />
          <line x1="18" y1="16" x2="22" y2="16" />
        </svg>
      );
  }
}

export function Sidebar({ open, onToggle, onHoverChange }: { open: boolean; onToggle: () => void; onHoverChange: (h: boolean) => void }) {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive) return;
        setPermissions(Array.isArray(j?.permissions) ? j.permissions : []);
      })
      .catch(() => setPermissions([]));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <aside
      className={
        'transition-all duration-200 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] shadow-sm ' +
        (open ? 'w-64' : 'w-16')
      }
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div className="h-14 flex items-center px-3 font-semibold text-[color:var(--sidebar-foreground)]">
        <button
          aria-label="Toggle sidebar"
          onClick={onToggle}
          className="mr-2 rounded p-1 hover:bg-[var(--muted)]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
        {open ? (
          <Image src="/logo.svg" alt="UBO Portal" width={96} height={24} priority className="h-6 w-auto" />
        ) : null}
      </div>
      <nav className="mt-2">
        {links
          .filter((item) => {
            const permMap: Record<string, string> = {
              '/': 'dashboard:view',
              '/clients': 'clients:view',
              '/portfolios': 'portfolios:view',
              '/compliance': 'compliance:view',
              '/settings': 'settings:view',
            };
            const need = permMap[item.href];
            return permissions ? permissions.includes(need) : true;
          })
          .map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={
                'flex items-center gap-3 px-4 py-2 text-sm ' +
                (active
                  ? 'bg-[var(--sidebar-accent)] text-[color:var(--sidebar-accent-foreground)]'
                  : 'text-[color:var(--sidebar-foreground)] hover:bg-[var(--muted)]')
              }
            >
              <Icon name={item.icon} />
              <span className={open ? 'block' : 'hidden'}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
