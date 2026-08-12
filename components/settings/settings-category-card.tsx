'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SettingsCategory } from '@/components/settings/settings-data';
import { useSettingsStore } from '@/components/settings/settings-store';
import { SettingsStatusBadge, getAccentStyles } from '@/components/settings/settings-ui';

export function SettingsCategoryCard({ category, index = 0 }: { category: SettingsCategory; index?: number }) {
  const store = useSettingsStore();
  const Icon = category.icon;
  const accent = getAccentStyles(category.accent);
  const status = store.statusBySlug[category.slug] ?? category.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link
        href={`/settings/${category.slug}`}
        className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 ${accent.ring}`}
        aria-label={`Configure ${category.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.wrap}`}>
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <SettingsStatusBadge status={status} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{category.title}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{category.description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition group-hover:gap-1.5 dark:text-brand-300">
          Configure
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}
