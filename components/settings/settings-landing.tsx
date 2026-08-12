'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SettingsCategoryCard } from '@/components/settings/settings-category-card';
import { SETTINGS_CATEGORIES } from '@/components/settings/settings-data';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsInfoPanel } from '@/components/settings/settings-info-panel';
import { SettingsQuickActions } from '@/components/settings/settings-quick-actions';
import { SettingsLandingSkeleton } from '@/components/settings/settings-skeleton';
import { SettingsEmptyState } from '@/components/settings/settings-ui';
import {
  exportSettingsPayload,
  resetAllSettings,
  useSettingsStore,
} from '@/components/settings/settings-store';

export function SettingsLanding() {
  const store = useSettingsStore();
  const [search, setSearch] = useState('');
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categories = useMemo(
    () =>
      SETTINGS_CATEGORIES.map((item) => ({
        ...item,
        status: store.statusBySlug[item.slug] ?? item.status,
      })),
    [store.statusBySlug],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some((keyword) => keyword.includes(query)),
    );
  }, [categories, search]);

  const focusSearch = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>('input[placeholder="Search settings modules…"]');
    input?.focus();
  }, []);

  const handleAction = useCallback(
    (actionId: 'search' | 'import' | 'export' | 'reset') => {
      if (actionId === 'search') {
        focusSearch();
        setToast('Search is ready — type a module name to filter cards.');
        return;
      }
      if (actionId === 'import') {
        fileInputRef.current?.click();
        return;
      }
      if (actionId === 'export') {
        const payload = exportSettingsPayload();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hrms-settings-export-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setToast('Configuration export downloaded with current module values.');
        return;
      }
      if (window.confirm('Reset all settings modules to baseline defaults?')) {
        resetAllSettings();
        setToast('All settings restored to defaults.');
      }
    },
    [focusSearch],
  );

  const handleImportFile = useCallback(async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        modules?: Array<{ slug: string; status?: string; values?: Record<string, string | number | boolean> }>;
      };
      if (!parsed.modules?.length) {
        setToast('Import failed — no modules found in file.');
        return;
      }
      const { saveModuleSettings } = await import('@/components/settings/settings-store');
      parsed.modules.forEach((module) => {
        if (module.slug && module.values) {
          saveModuleSettings(module.slug, module.values, 'Import');
        }
      });
      setToast(`Imported ${parsed.modules.length} module configuration(s).`);
    } catch {
      setToast('Import failed — invalid configuration file.');
    }
  }, []);

  if (!ready) {
    return <SettingsLandingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <SettingsHeader search={search} onSearchChange={setSearch} />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          handleImportFile(event.target.files?.[0] ?? null);
          event.target.value = '';
        }}
      />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-100"
        >
          {toast}
        </div>
      ) : null}

      <SettingsQuickActions onAction={handleAction} />

      <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/30">
        <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">Integrated with live HRMS modules</p>
        <p className="mt-1 text-xs leading-5 text-brand-800/90 dark:text-brand-200/90">
          Roles are extracted from AppRole/RBAC. Leave balances, Performance rating weights, Documents upload limits,
          Organization identity, Settings menu access, and Performance hub visibility all read from these configurations.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <section aria-labelledby="settings-categories-heading" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="settings-categories-heading" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Settings categories
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filtered.length} of {categories.length}
            </p>
          </div>

          {filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((category, index) => (
                <SettingsCategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          ) : (
            <SettingsEmptyState
              title="No settings modules found"
              description="Try another keyword such as payroll, security, leave, or branding."
            />
          )}
        </section>

        <SettingsInfoPanel categories={filtered} />
      </div>
    </div>
  );
}
