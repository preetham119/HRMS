'use client';

import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';

export function SettingsHeader({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-1 mb-2 border-b border-slate-200/80 bg-[#f4f6f8]/95 px-1 pb-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/dashboard" className="transition hover:text-brand-700 dark:hover:text-brand-300">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="font-medium text-slate-800 dark:text-slate-200">Settings</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Settings</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Open any module card and use Configure to edit policies, workflows, and system preferences.
            Changes save in this browser and update status on the hub.
          </p>
        </div>

        <label className="relative block w-full max-w-md">
          <span className="sr-only">Search settings</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search settings modules…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-950"
          />
        </label>
      </div>
    </header>
  );
}
