import React, { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '../Utils/classNames';

export interface SectionTab {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Match only this exact path (for the section's index tab). */
  end?: boolean;
}

/** Groups related pages under one menu entry, with URL-backed tabs. */
export const SectionTabs: React.FC<{ title: string; emoji: string; tabs: SectionTab[] }> = ({ title, emoji, tabs }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">{emoji} {title}</span>
      <nav className="flex gap-1 p-1 rounded-2xl bg-glass/40 border border-glass/60 backdrop-blur-md w-fit max-w-full overflow-x-auto" aria-label={title}>
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all',
              isActive ? 'bg-moss text-white shadow-md' : 'text-ink-soft hover:text-ink hover:bg-glass/60'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
    <Suspense fallback={<div className="flex justify-center py-20 text-3xl animate-bounce">{emoji}</div>}>
      <Outlet />
    </Suspense>
  </div>
);
