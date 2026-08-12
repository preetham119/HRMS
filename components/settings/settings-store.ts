'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { SETTINGS_CATEGORIES, type SettingsStatus } from '@/components/settings/settings-data';
import { SETTINGS_MODULE_CONFIGS, getModuleConfig } from '@/components/settings/settings-fields';
import { HRMS_SETTINGS_STORAGE_KEY } from '@/lib/settings/constants';

export type SettingsValues = Record<string, string | number | boolean>;

export type SettingsRecentChange = {
  id: string;
  module: string;
  action: string;
  actor: string;
  at: string;
};

type SettingsStoreState = {
  valuesBySlug: Record<string, SettingsValues>;
  statusBySlug: Record<string, SettingsStatus>;
  recentChanges: SettingsRecentChange[];
  lastUpdated: string;
};

function formatNow() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function buildDefaults(): SettingsStoreState {
  const valuesBySlug: Record<string, SettingsValues> = {};
  const statusBySlug: Record<string, SettingsStatus> = {};
  for (const category of SETTINGS_CATEGORIES) {
    const config = SETTINGS_MODULE_CONFIGS[category.slug];
    valuesBySlug[category.slug] = { ...(config?.defaults ?? {}) };
    statusBySlug[category.slug] = config?.initialStatus ?? category.status;
  }
  return {
    valuesBySlug,
    statusBySlug,
    recentChanges: [
      {
        id: 'rc-seed-1',
        module: 'Security & Authentication',
        action: 'Enabled MFA for admin roles',
        actor: 'HR Admin',
        at: 'Today · 10:42 AM',
      },
      {
        id: 'rc-seed-2',
        module: 'Leave Management Settings',
        action: 'Updated sandwich rule for CL',
        actor: 'System Admin',
        at: 'Yesterday · 4:18 PM',
      },
    ],
    lastUpdated: formatNow(),
  };
}

function readStore(): SettingsStoreState {
  if (typeof window === 'undefined') return buildDefaults();
  try {
    const raw = window.localStorage.getItem(HRMS_SETTINGS_STORAGE_KEY);
    if (!raw) return buildDefaults();
    const parsed = JSON.parse(raw) as Partial<SettingsStoreState>;
    const base = buildDefaults();
    return {
      valuesBySlug: { ...base.valuesBySlug, ...(parsed.valuesBySlug ?? {}) },
      statusBySlug: { ...base.statusBySlug, ...(parsed.statusBySlug ?? {}) },
      recentChanges: parsed.recentChanges?.length ? parsed.recentChanges : base.recentChanges,
      lastUpdated: parsed.lastUpdated || base.lastUpdated,
    };
  } catch {
    return buildDefaults();
  }
}

let memoryStore: SettingsStoreState | null = null;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (!memoryStore) memoryStore = readStore();
  return memoryStore;
}

function getServerSnapshot() {
  return buildDefaults();
}

function persist(next: SettingsStoreState) {
  memoryStore = next;
  try {
    window.localStorage.setItem(HRMS_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettingsStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getModuleValues(slug: string): SettingsValues {
  const store = getSnapshot();
  const config = getModuleConfig(slug);
  return { ...(config?.defaults ?? {}), ...(store.valuesBySlug[slug] ?? {}) };
}

export function getModuleStatus(slug: string): SettingsStatus {
  const store = getSnapshot();
  return store.statusBySlug[slug] ?? SETTINGS_CATEGORIES.find((c) => c.slug === slug)?.status ?? 'Pending';
}

export function saveModuleSettings(slug: string, values: SettingsValues, actor = 'Current user') {
  const store = getSnapshot();
  const category = SETTINGS_CATEGORIES.find((item) => item.slug === slug);
  const nextStatus: SettingsStatus =
    typeof values.moduleEnabled === 'boolean' && values.moduleEnabled === false
      ? 'Disabled'
      : typeof values.assistantsEnabled === 'boolean' && values.assistantsEnabled === false && slug === 'ai-configuration'
        ? 'Disabled'
        : 'Configured';

  const change: SettingsRecentChange = {
    id: `rc-${Date.now()}`,
    module: category?.title ?? slug,
    action: 'Saved configuration changes',
    actor,
    at: formatNow(),
  };

  persist({
    ...store,
    valuesBySlug: { ...store.valuesBySlug, [slug]: values },
    statusBySlug: { ...store.statusBySlug, [slug]: nextStatus },
    recentChanges: [change, ...store.recentChanges].slice(0, 8),
    lastUpdated: formatNow(),
  });

  return nextStatus;
}

export function resetModuleSettings(slug: string, actor = 'Current user') {
  const store = getSnapshot();
  const config = getModuleConfig(slug);
  const category = SETTINGS_CATEGORIES.find((item) => item.slug === slug);
  const defaults = { ...(config?.defaults ?? {}) };
  const status = config?.initialStatus ?? 'Pending';

  const change: SettingsRecentChange = {
    id: `rc-${Date.now()}`,
    module: category?.title ?? slug,
    action: 'Reset module to defaults',
    actor,
    at: formatNow(),
  };

  persist({
    ...store,
    valuesBySlug: { ...store.valuesBySlug, [slug]: defaults },
    statusBySlug: { ...store.statusBySlug, [slug]: status },
    recentChanges: [change, ...store.recentChanges].slice(0, 8),
    lastUpdated: formatNow(),
  });

  return { values: defaults, status };
}

export function resetAllSettings() {
  const next = buildDefaults();
  next.recentChanges = [
    {
      id: `rc-${Date.now()}`,
      module: 'System Preferences',
      action: 'Reset all modules to baseline defaults',
      actor: 'Current user',
      at: formatNow(),
    },
    ...next.recentChanges,
  ].slice(0, 8);
  persist(next);
  return next;
}

export function exportSettingsPayload() {
  const store = getSnapshot();
  return {
    exportedAt: new Date().toISOString(),
    lastUpdated: store.lastUpdated,
    modules: SETTINGS_CATEGORIES.map((item) => ({
      slug: item.slug,
      title: item.title,
      status: store.statusBySlug[item.slug] ?? item.status,
      values: store.valuesBySlug[item.slug] ?? {},
    })),
  };
}

export function useModuleSettings(slug: string) {
  const store = useSettingsStore();
  const config = getModuleConfig(slug);
  const [draft, setDraft] = useState<SettingsValues>(() => getModuleValues(slug));
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft(getModuleValues(slug));
    setDirty(false);
  }, [slug, store.valuesBySlug[slug], store.statusBySlug[slug]]);

  const updateField = useCallback((key: string, value: string | number | boolean) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const save = useCallback(() => {
    const status = saveModuleSettings(slug, draft);
    setDirty(false);
    setMessage(`Saved · status set to ${status}`);
    window.setTimeout(() => setMessage(''), 2500);
    return status;
  }, [draft, slug]);

  const reset = useCallback(() => {
    const result = resetModuleSettings(slug);
    setDraft(result.values);
    setDirty(false);
    setMessage('Restored defaults');
    window.setTimeout(() => setMessage(''), 2500);
    return result;
  }, [slug]);

  return {
    config,
    draft,
    dirty,
    message,
    status: store.statusBySlug[slug] ?? config?.initialStatus ?? 'Pending',
    updateField,
    save,
    reset,
    lastUpdated: store.lastUpdated,
  };
}
