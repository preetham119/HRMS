'use client';

import { Activity, CheckCircle2, Clock3, Layers3 } from 'lucide-react';
import {
  SETTINGS_META,
  getSettingsStats,
  type SettingsCategory,
} from '@/components/settings/settings-data';
import { useSettingsStore } from '@/components/settings/settings-store';

export function SettingsInfoPanel({ categories }: { categories: SettingsCategory[] }) {
  const store = useSettingsStore();
  const withLiveStatus = categories.map((item) => ({
    ...item,
    status: store.statusBySlug[item.slug] ?? item.status,
  }));
  const stats = getSettingsStats(withLiveStatus);
  const overall = getSettingsStats(
    categories.map((item) => ({
      ...item,
      status: store.statusBySlug[item.slug] ?? item.status,
    })),
  );

  return (
    <aside className="space-y-4 xl:sticky xl:top-28">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Configuration overview</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Live snapshot of your settings posture</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <StatRow icon={Layers3} label="Total modules" value={String(overall.total)} tone="slate" />
          <StatRow icon={CheckCircle2} label="Configured" value={String(stats.configured)} tone="emerald" />
          <StatRow icon={Clock3} label="Pending" value={String(stats.pending)} tone="amber" />
          <StatRow icon={Activity} label="System health" value={SETTINGS_META.health} tone="sky" />
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Last updated</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{store.lastUpdated}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent configuration changes</h2>
        <ul className="mt-4 space-y-3">
          {store.recentChanges.map((change) => (
            <li key={change.id} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{change.module}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{change.action}</p>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {change.actor} · {change.at}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">System health: Healthy</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-emerald-800/90 dark:text-emerald-300/90">
          All critical services are operational. {SETTINGS_META.version} · {SETTINGS_META.environment}
        </p>
      </section>
    </aside>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Layers3;
  label: string;
  value: string;
  tone: 'slate' | 'emerald' | 'amber' | 'sky';
}) {
  const toneMap = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/40">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}
