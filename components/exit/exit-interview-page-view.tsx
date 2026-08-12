'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, MessagesSquare } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useExit } from '@/components/exit/exit-provider';
import { ExitTimeline } from '@/components/exit/exit-timeline';
import { ExitStatusBadge } from '@/components/exit/status-badge';
import { StageLockedState } from '@/components/exit/stage-locked-state';
import { AuditLogList } from '@/components/exit/audit-log-list';
import { canCompleteExitInterview } from '@/lib/exit/permissions';
import { exitInterviewSchema, type ExitInterviewFormValues } from '@/lib/exit/schemas';
import { EXIT_INTERVIEW_REASONS } from '@/lib/exit/types';

export function ExitInterviewPageView() {
  const { user } = useAuth();
  const { exitCase, stageAccess, loading, error, message, runAction, setError, clearFeedback } = useExit();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ExitInterviewFormValues>({
    resolver: zodResolver(exitInterviewSchema),
    mode: 'onChange',
    defaultValues: {
      primaryReason: undefined,
      experienceRating: 3,
      managerRating: 3,
      wouldRecommend: undefined,
      likedMost: '',
      improvements: '',
      additionalComments: '',
    },
  });

  useEffect(() => {
    if (!exitCase?.exitInterview) return;
    form.reset({
      primaryReason: (exitCase.exitInterview.primaryReason as ExitInterviewFormValues['primaryReason']) || undefined,
      experienceRating: exitCase.exitInterview.experienceRating || 3,
      managerRating: exitCase.exitInterview.managerRating || 3,
      wouldRecommend: (exitCase.exitInterview.wouldRecommend as ExitInterviewFormValues['wouldRecommend']) || undefined,
      likedMost: exitCase.exitInterview.likedMost || '',
      improvements: exitCase.exitInterview.improvements || '',
      additionalComments: exitCase.exitInterview.additionalComments || '',
    });
  }, [exitCase, form]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading exit interview…
      </div>
    );
  }

  const enabled = stageAccess.exitInterview === 'enabled';
  const completed = stageAccess.exitInterview === 'completed' || Boolean(exitCase?.exitInterview?.completed);
  const canEdit = canCompleteExitInterview(user?.role, exitCase, user?.employeeId) && enabled && !completed;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Exit Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Exit Interview</h1>
            <p className="mt-2 text-sm text-slate-500">Share structured feedback after resignation approval.</p>
          </div>
          {exitCase ? <ExitStatusBadge status={exitCase.status} /> : <ExitStatusBadge status="Draft" />}
        </div>
        <div className="mt-6">
          <ExitTimeline exitCase={exitCase} />
        </div>
      </section>

      {(error || message) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      {stageAccess.exitInterview === 'locked' ? (
        <StageLockedState
          title="Exit Interview is locked"
          description="This stage unlocks automatically after both Manager and HR approve the resignation."
          ctaHref="/exit/resignation"
          ctaLabel="Go to Resignation"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <MessagesSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Interview questionnaire</h2>
                <p className="text-sm text-slate-500">{completed ? 'Submitted and locked.' : 'All fields are required unless marked optional.'}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Primary reason for leaving</span>
                <select
                  disabled={!canEdit}
                  {...form.register('primaryReason')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                >
                  <option value="">Select reason</option>
                  {EXIT_INTERVIEW_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {form.formState.errors.primaryReason && (
                  <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.primaryReason.message}</span>
                )}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-700">Overall experience (1-5)</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    disabled={!canEdit}
                    {...form.register('experienceRating')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-700">Manager experience (1-5)</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    disabled={!canEdit}
                    {...form.register('managerRating')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                  />
                </label>
              </div>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Would you recommend this company?</span>
                <select
                  disabled={!canEdit}
                  {...form.register('wouldRecommend')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">What did you like most?</span>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  {...form.register('likedMost')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                />
                {form.formState.errors.likedMost && (
                  <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.likedMost.message}</span>
                )}
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">What can we improve?</span>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  {...form.register('improvements')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                />
                {form.formState.errors.improvements && (
                  <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.improvements.message}</span>
                )}
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Additional comments (optional)</span>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  {...form.register('additionalComments')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                />
              </label>
            </div>

            {canEdit && (
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  clearFeedback();
                  const valid = await form.trigger();
                  if (!valid || !exitCase) return;
                  setSubmitting(true);
                  try {
                    await runAction({
                      action: 'complete-interview',
                      exitId: exitCase.id,
                      ...form.getValues(),
                    });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to submit interview');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Submit exit interview
              </button>
            )}
          </section>

          <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Audit log</h3>
            <div className="mt-4">
              <AuditLogList logs={exitCase?.auditLogs ?? []} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
