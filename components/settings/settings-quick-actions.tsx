'use client';

import { Download, RotateCcw, Search, Upload } from 'lucide-react';
import { SettingsTooltip } from '@/components/settings/settings-ui';

const actions = [
  {
    id: 'search',
    label: 'Search Settings',
    description: 'Jump to any module',
    icon: Search,
    tip: 'Focus the global settings search',
  },
  {
    id: 'import',
    label: 'Import Configuration',
    description: 'Upload a config package',
    icon: Upload,
    tip: 'Import settings from a JSON/YAML package',
  },
  {
    id: 'export',
    label: 'Export Configuration',
    description: 'Download current setup',
    icon: Download,
    tip: 'Export configured modules for backup or migration',
  },
  {
    id: 'reset',
    label: 'Reset to Default',
    description: 'Restore baseline values',
    icon: RotateCcw,
    tip: 'Reset selected modules to factory defaults',
  },
] as const;

export function SettingsQuickActions({
  onAction,
}: {
  onAction: (actionId: (typeof actions)[number]['id']) => void;
}) {
  return (
    <section aria-labelledby="settings-quick-actions">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="settings-quick-actions" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Quick Actions
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <SettingsTooltip key={action.id} label={action.tip}>
              <button
                type="button"
                onClick={() => onAction(action.id)}
                className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{action.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{action.description}</span>
                </span>
              </button>
            </SettingsTooltip>
          );
        })}
      </div>
    </section>
  );
}
