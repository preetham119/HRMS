'use client';

import type { ReactNode } from 'react';
import type { SettingsStatus } from '@/components/settings/settings-data';

const accentStyles = {
  sky: {
    wrap: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    ring: 'group-hover:border-sky-200 dark:group-hover:border-sky-800',
  },
  emerald: {
    wrap: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    ring: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-800',
  },
  amber: {
    wrap: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    ring: 'group-hover:border-amber-200 dark:group-hover:border-amber-800',
  },
  rose: {
    wrap: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    ring: 'group-hover:border-rose-200 dark:group-hover:border-rose-800',
  },
  violet: {
    wrap: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    ring: 'group-hover:border-violet-200 dark:group-hover:border-violet-800',
  },
  teal: {
    wrap: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
    ring: 'group-hover:border-teal-200 dark:group-hover:border-teal-800',
  },
  slate: {
    wrap: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    ring: 'group-hover:border-slate-300 dark:group-hover:border-slate-600',
  },
  indigo: {
    wrap: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    ring: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-800',
  },
} as const;

export type SettingsAccent = keyof typeof accentStyles;

export function getAccentStyles(accent: SettingsAccent) {
  return accentStyles[accent];
}

export function SettingsStatusBadge({ status }: { status: SettingsStatus }) {
  const styles =
    status === 'Configured'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900'
      : status === 'Pending'
        ? 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900'
        : 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${styles}`}>
      {status}
    </span>
  );
}

export function SettingsTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-sm transition group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 dark:bg-slate-700"
      >
        {label}
      </span>
    </span>
  );
}

export function SettingsEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
