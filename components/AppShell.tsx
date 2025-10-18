'use client';

import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useState } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  // Sidebar starts collapsed; expand on hover or when pinned via burger
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const open = pinned || hovering;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={open}
        onToggle={() =>
          setPinned((prev) => {
            const next = !prev;
            if (!next) setHovering(false);
            return next;
          })
        }
        onHoverChange={(h: boolean) => setHovering(h)}
      />
      <div className="flex-1 min-w-0">
        <Topbar onToggleSidebar={() => setPinned((v) => !v)} />
        <main className="bg-[var(--background)] min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </div>
  );
}
