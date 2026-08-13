'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BadgeIndianRupee, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useExit } from '@/components/exit/exit-provider';
import { ExitTimeline } from '@/components/exit/exit-timeline';
import { ExitStatusBadge } from '@/components/exit/status-badge';
import { StageLockedState } from '@/components/exit/stage-locked-state';
import { AuditLogList } from '@/components/exit/audit-log-list';
import { canProcessFullAndFinal } from '@/lib/exit/permissions';
import { fullAndFinalSchema, type FullAndFinalFormValues } from '@/lib/exit/schemas';

export function FullFinalPageView() {
  const { user } = useAuth();
  const { exitCase, cases, stageAccess, loading, error, message, runAction, selectCase, setError, clearFeedback } = useExit();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FullAndFinalFormValues>({
    resolver: zodResolver(fullAndFinalSchema),
    mode: 'onChange',
    defaultValues: {
      assetsReturned: false,
      accessRevoked: false,
      leaveEncashment: 0,
      gratuityAmount: 0,
      otherDues: 0,
      deductions: 0,
      paymentMode: '',
      remarks: '',
    },
  });

  useEffect(() => {
    if (!exitCase?.fullAndFinal) return;
    form.reset({
      assetsReturned: exitCase.fullAndFinal.assetsReturned,
      accessRevoked: exitCase.fullAndFinal.accessRevoked,
      leaveEncashment: exitCase.fullAndFinal.leaveEncashment,
      gratuityAmount: exitCase.fullAndFinal.gratuityAmount,
      otherDues: exitCase.fullAndFinal.otherDues,
      deductions: exitCase.fullAndFinal.deductions,
      paymentMode: exitCase.fullAndFinal.paymentMode || '',
      remarks: exitCase.fullAndFinal.remarks || '',
    });
  }, [exitCase, form]);

  const watched = form.watch();
  const netPayable = useMemo(
    () =>
      Number(watched.leaveEncashment || 0) +
      Number(watched.gratuityAmount || 0) +
      Number(watched.otherDues || 0) -
      Number(watched.deductions || 0),
    [watched.leaveEncashment, watched.gratuityAmount, watched.otherDues, watched.deductions],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Full & Final…
      </div>
    );
  }

  const enabled = stageAccess.fullAndFinal === 'enabled';
  const completed = stageAccess.fullAndFinal === 'completed' || exitCase?.fullAndFinal?.status === 'Completed';
  const canEdit = canProcessFullAndFinal(user?.role, exitCase) && enabled && !completed;
  const isEmployeeView =
    user?.role === 'EMPLOYEE_PR' ||
    user?.role === 'EMPLOYEE_CONT' ||
    user?.role === 'MANAGER';

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Exit Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Full & Final</h1>
            <p className="mt-2 text-sm text-slate-500">Settlement, clearances, and final payout processing.</p>
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

      {stageAccess.fullAndFinal === 'locked' ? (
        <StageLockedState
          title="Full & Final is locked"
          description="This stage unlocks automatically after the Exit Interview is completed."
          ctaHref="/exit/exit-interview"
          ctaLabel="Go to Exit Interview"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <BadgeIndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Settlement worksheet</h2>
                <p className="text-sm text-slate-500">
                  {completed
                    ? 'Settlement completed.'
                    : canEdit
                      ? 'Finance / HR can update and complete settlement.'
                      : 'View-only settlement progress.'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" disabled={!canEdit} {...form.register('assetsReturned')} className="h-4 w-4 accent-brand-600" />
                Company assets returned
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" disabled={!canEdit} {...form.register('accessRevoked')} className="h-4 w-4 accent-brand-600" />
                System access revoked
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Leave encashment</span>
                <input type="number" min={0} step="0.01" disabled={!canEdit} {...form.register('leaveEncashment')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Gratuity amount</span>
                <input type="number" min={0} step="0.01" disabled={!canEdit} {...form.register('gratuityAmount')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Other dues</span>
                <input type="number" min={0} step="0.01" disabled={!canEdit} {...form.register('otherDues')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Deductions</span>
                <input type="number" min={0} step="0.01" disabled={!canEdit} {...form.register('deductions')} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Payment mode</span>
                <select
                  disabled={!canEdit}
                  {...form.register('paymentMode')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                >
                  <option value="">Select mode</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Payroll">Payroll</option>
                </select>
                {form.formState.errors.paymentMode && (
                  <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.paymentMode.message}</span>
                )}
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Remarks</span>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  {...form.register('remarks')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Estimated net payable: <span className="font-semibold">₹ {netPayable.toLocaleString('en-IN')}</span>
            </div>

            {canEdit && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    clearFeedback();
                    const valid = await form.trigger();
                    if (!valid || !exitCase) return;
                    setSubmitting(true);
                    try {
                      await runAction({ action: 'save-fnf', exitId: exitCase.id, ...form.getValues() });
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to save settlement');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Save progress
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    clearFeedback();
                    const valid = await form.trigger();
                    if (!valid || !exitCase) return;
                    setSubmitting(true);
                    try {
                      await runAction({ action: 'complete-fnf', exitId: exitCase.id, ...form.getValues() });
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to complete settlement');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Mark completed
                </button>
              </div>
            )}

            {isEmployeeView && !canEdit && (
              <p className="mt-4 text-sm text-slate-500">
                Finance will process your settlement. You can track status here once Exit Interview is done.
              </p>
            )}
          </section>

          <aside className="space-y-6">
            {(user?.role === 'FINANCE' || user?.role === 'HR' || user?.role === 'ADMIN') && cases.length > 0 && (
              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Settlement queue</h3>
                <div className="mt-4 space-y-3">
                  {cases
                    .filter((item) =>
                      ['Full & Final Pending', 'Exit Interview Completed', 'Completed'].includes(item.status),
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectCase(item.id)}
                        className={`w-full rounded-2xl border p-3 text-left ${
                          exitCase?.id === item.id ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{item.employeeName}</p>
                          <ExitStatusBadge status={item.status} />
                        </div>
                      </button>
                    ))}
                </div>
              </section>
            )}
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Audit log</h3>
              <div className="mt-4">
                <AuditLogList logs={exitCase?.auditLogs ?? []} />
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
