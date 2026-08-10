'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarClock,
  BarChart3,
  BrainCircuit,
  Briefcase,
  BookOpen,
  Target,
  FileBarChart,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dsa', label: 'DSA', icon: BrainCircuit },
  { to: '/jobs', label: 'Job Applications', icon: Briefcase },
  { to: '/learning', label: 'Learning', icon: BookOpen },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/30">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Productivity OS</p>
              <p className="text-[11px] text-sidebar-muted">for Sahil</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-sidebar-muted hover:bg-white/5 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={onCloseMobile}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-sidebar-active/15 text-white' : 'text-sidebar-muted hover:bg-white/5 hover:text-white',
                )}
              >
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-sidebar-active' : '')} />
                <span>{item.label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-active" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-6 py-4">
          <p className="text-[11px] leading-relaxed text-sidebar-muted">
            Built for deep work.
            <br />
            8–10 focused hours, every day.
          </p>
        </div>
      </aside>
    </>
  );
}
