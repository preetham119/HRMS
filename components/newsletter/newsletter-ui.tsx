'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type Accent = 'sky' | 'amber' | 'slate' | 'emerald' | 'rose' | 'teal' | 'indigo';

const accentMap: Record<
  Accent,
  { iconWrap: string; icon: string; bar: string }
> = {
  sky: { iconWrap: 'bg-sky-50', icon: 'text-sky-600', bar: 'bg-sky-500' },
  amber: { iconWrap: 'bg-amber-50', icon: 'text-amber-600', bar: 'bg-amber-500' },
  slate: { iconWrap: 'bg-slate-100', icon: 'text-slate-600', bar: 'bg-slate-500' },
  emerald: { iconWrap: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500' },
  rose: { iconWrap: 'bg-rose-50', icon: 'text-rose-600', bar: 'bg-rose-500' },
  teal: { iconWrap: 'bg-teal-50', icon: 'text-teal-600', bar: 'bg-teal-500' },
  indigo: { iconWrap: 'bg-indigo-50', icon: 'text-indigo-600', bar: 'bg-indigo-500' },
};

export function NewsletterSectionCard({
  title,
  subtitle,
  icon: Icon,
  accent = 'slate',
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  accent?: Accent;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const theme = accentMap[accent];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.iconWrap}`}>
            <Icon className={`h-4 w-4 ${theme.icon}`} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${theme.bar}`} aria-hidden />
              <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
            </div>
            {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div className="flex flex-1 flex-col p-5">{children}</div>
    </motion.section>
  );
}

export function NewsletterEmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
