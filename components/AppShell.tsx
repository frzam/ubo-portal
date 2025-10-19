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
    <div className="flex h-screen overflow-hidden">
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
      <div className="flex-1 min-w-0 h-screen flex flex-col">
        <Topbar onToggleSidebar={() => setPinned((v) => !v)} />
        <main className="bg-[var(--background)] flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
