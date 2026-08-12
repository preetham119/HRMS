'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, ExternalLink, RotateCcw, Save } from 'lucide-react';
import { findSettingsCategory } from '@/components/settings/settings-data';
import { getModuleConfig } from '@/components/settings/settings-fields';
import { useModuleSettings } from '@/components/settings/settings-store';
import { RolesDirectoryPanel } from '@/components/settings/roles-directory';
import { SettingsStatusBadge, getAccentStyles } from '@/components/settings/settings-ui';
import { getLeaveSettings, getPerformanceSettings, getOrganizationSettings, getDocumentsSettings } from '@/lib/settings';

export function SettingsCategoryDetail({ slug }: { slug: string }) {
  const category = findSettingsCategory(slug);
  const config = getModuleConfig(slug);
  const { draft, dirty, message, status, updateField, save, reset } = useModuleSettings(slug);

  if (!category || !config) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Settings module not found</p>
        <Link href="/settings" className="mt-4 inline-flex text-sm font-semibold text-brand-700 underline dark:text-brand-300">
          Back to Settings
        </Link>
      </div>
    );
  }

  const Icon = category.icon;
  const accent = getAccentStyles(category.accent);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/dashboard" className="hover:text-brand-700 dark:hover:text-brand-300">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/settings" className="hover:text-brand-700 dark:hover:text-brand-300">
          Settings
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="font-medium text-slate-800 dark:text-slate-200">{category.title}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          All settings
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {message ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {message}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => save()}
            disabled={!dirty}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-6 sm:px-8 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.wrap}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">{category.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{category.description}</p>
                {slug === 'performance' ? (
                  <Link
                    href="/performance"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300"
                  >
                    Open Performance hub
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
            <SettingsStatusBadge status={status} />
          </div>
        </div>

        <form
          className="space-y-8 px-6 py-8 sm:px-8"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          {slug === 'user-roles' ? <RolesDirectoryPanel /> : null}

          {slug === 'leave' || slug === 'performance' || slug === 'organization' || slug === 'documents' ? (
            <IntegrationHint slug={slug} />
          ) : null}

          {config.sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
              {section.description ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => {
                  const value = draft[field.key];
                  const fieldId = `${slug}-${field.key}`;

                  if (field.type === 'toggle') {
                    return (
                      <label
                        key={field.key}
                        htmlFor={fieldId}
                        className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:col-span-2 dark:border-slate-700 dark:bg-slate-900"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{field.label}</span>
                          {field.description ? (
                            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{field.description}</span>
                          ) : null}
                        </span>
                        <input
                          id={fieldId}
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => updateField(field.key, event.target.checked)}
                          className="mt-1 h-5 w-9 cursor-pointer appearance-none rounded-full bg-slate-200 transition checked:bg-brand-600 dark:bg-slate-700"
                          style={{
                            backgroundImage: Boolean(value)
                              ? 'radial-gradient(circle at 70% 50%, white 35%, transparent 40%)'
                              : 'radial-gradient(circle at 30% 50%, white 35%, transparent 40%)',
                          }}
                        />
                      </label>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <label key={field.key} htmlFor={fieldId} className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</span>
                        <select
                          id={fieldId}
                          value={String(value ?? '')}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <label key={field.key} htmlFor={fieldId} className="block space-y-1.5 sm:col-span-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</span>
                        <textarea
                          id={fieldId}
                          rows={4}
                          value={String(value ?? '')}
                          placeholder={field.placeholder}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                    );
                  }

                  return (
                    <label key={field.key} htmlFor={fieldId} className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</span>
                      {field.description ? (
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{field.description}</span>
                      ) : null}
                      <input
                        id={fieldId}
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={value === undefined || value === null ? '' : String(value)}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        onChange={(event) =>
                          updateField(
                            field.key,
                            field.type === 'number' ? Number(event.target.value || 0) : event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dirty ? 'You have unsaved changes.' : 'All changes are saved locally in this browser.'}
            </p>
            <button
              type="submit"
              disabled={!dirty}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save configuration
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function IntegrationHint({ slug }: { slug: string }) {
  if (slug === 'leave') {
    const leave = getLeaveSettings();
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
        Connected to Leave: annual {leave.annualLeaveDays}, casual {leave.casualLeaveDays}, sick {leave.sickLeaveDays},
        sandwich {leave.sandwichRule ? 'on' : 'off'}, approval `{leave.approvalLevels}`.
      </div>
    );
  }
  if (slug === 'performance') {
    const perf = getPerformanceSettings();
    return (
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm text-violet-900 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200">
        Connected to Performance ratings: goals {perf.goalWeight}% · competencies {perf.competencyWeight}% · hub{' '}
        {perf.openPerformanceHub ? 'visible' : 'hidden'} · workflow `{perf.workflow}`.
      </div>
    );
  }
  if (slug === 'organization') {
    const org = getOrganizationSettings();
    return (
      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
        Connected to My Org / portal identity: {org.companyName} · {org.headquarters} · {org.currency} · FY starts{' '}
        {org.fiscalYearStart}.
      </div>
    );
  }
  if (slug === 'documents') {
    const docs = getDocumentsSettings();
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        Connected to Documents upload: max {docs.maxUploadMb} MB · types {docs.allowedTypes.join(', ')} · retention{' '}
        {docs.retentionYears} years.
      </div>
    );
  }
  return null;
}
