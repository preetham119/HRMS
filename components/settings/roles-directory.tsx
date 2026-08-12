'use client';

import { Mail, LayoutGrid, Sparkles, Shield } from 'lucide-react';
import { getRolesCatalog, getUserRolesSettings } from '@/lib/settings';
import { useSettingsStore } from '@/components/settings/settings-store';

export function RolesDirectoryPanel() {
  // Subscribe so the catalog re-reads after settings saves
  useSettingsStore();
  const live = getRolesCatalog(getUserRolesSettings().settingsAccessRoles);

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Live role catalog</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Extracted from AppRole, portal navigation, appraisal personas, and learning permissions.
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
          {live.length} roles
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {live.map((entry) => (
          <article
            key={entry.role}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {entry.label}{' '}
                  <span className="font-mono text-xs text-slate-400">({entry.role})</span>
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{entry.description}</p>
              </div>
              {entry.canManageSettings ? (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Settings
                </span>
              ) : null}
            </div>

            <dl className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <dd className="font-medium">{entry.demoEmail}</dd>
              </div>
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5 text-slate-400" />
                <dd>{entry.portalBrand}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                <dd>
                  Appraisal persona: <span className="font-semibold">{entry.appraisalPersona}</span>
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <dd>Learning: {entry.learningPermissions.join(', ') || 'none'}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.navModules.slice(0, 8).map((module) => (
                <span
                  key={module}
                  className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {module}
                </span>
              ))}
              {entry.navModules.length > 8 ? (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800">
                  +{entry.navModules.length - 8} more
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
