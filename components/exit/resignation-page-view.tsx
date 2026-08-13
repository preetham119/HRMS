'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CheckCircle2, FileUp, Loader2, RotateCcw, ShieldCheck, Upload, XCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useExit } from '@/components/exit/exit-provider';
import { ExitTimeline } from '@/components/exit/exit-timeline';
import { ExitStatusBadge } from '@/components/exit/status-badge';
import { AuditLogList } from '@/components/exit/audit-log-list';
import { ExitNotifications } from '@/components/exit/exit-notifications';
import { isEmployeeRole } from '@/lib/auth';
import {
  canApproveAsHr,
  canApproveAsManager,
  canReopenResignation,
  canRequestWithdrawal,
  canReviewWithdrawal,
} from '@/lib/exit/permissions';
import { resignationSchema, withdrawalSchema, type ResignationFormValues } from '@/lib/exit/schemas';
import { RESIGNATION_REASONS } from '@/lib/exit/types';

const MAX_LETTER_BYTES = 5 * 1024 * 1024;

function todayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ResignationPageView() {
  const { user } = useAuth();
  const { exitCase, cases, notifications, loading, error, message, runAction, selectCase, setError, clearFeedback } = useExit();
  const [submitting, setSubmitting] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [letterMeta, setLetterMeta] = useState<{
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    dataUrl?: string;
  }>({});

  const locked = Boolean(exitCase?.formLocked && exitCase.status !== 'Draft');
  const minDate = todayIsoDate();

  const form = useForm<ResignationFormValues>({
    resolver: zodResolver(resignationSchema),
    mode: 'onChange',
    defaultValues: {
      resignationDate: '',
      lastWorkingDay: '',
      noticePeriodDays: 30,
      reasonCategory: undefined,
      reasonDetails: '',
      letterFileName: '',
    },
  });

  const resignationDate = form.watch('resignationDate');
  const lastWorkingDayMin = resignationDate && resignationDate > minDate ? resignationDate : minDate;

  useEffect(() => {
    if (!exitCase) return;
    form.reset({
      resignationDate: exitCase.resignationDate || '',
      lastWorkingDay: exitCase.lastWorkingDay || '',
      noticePeriodDays: exitCase.noticePeriodDays || 30,
      reasonCategory: (exitCase.reasonCategory as ResignationFormValues['reasonCategory']) || undefined,
      reasonDetails: exitCase.reasonDetails || '',
      letterFileName: exitCase.letterFileName || '',
    });
    setLetterMeta({
      fileName: exitCase.letterFileName,
      fileSize: exitCase.letterFileSize,
      mimeType: exitCase.letterMimeType,
      dataUrl: exitCase.letterDataUrl,
    });
  }, [exitCase, form]);

  const role = user?.role;
  const showManagerActions = canApproveAsManager(role, exitCase, user?.email);
  const showHrActions = canApproveAsHr(role, exitCase);
  const showWithdrawal = canRequestWithdrawal(role, exitCase, user?.employeeId);
  const showWithdrawalReview = canReviewWithdrawal(role, exitCase);
  const showReopen = canReopenResignation(role, exitCase);
  const pendingApprovals = useMemo(
    () =>
      cases.filter(
        (item) =>
          (item.status === 'Pending Approval' || item.status === 'Submitted') &&
          ((role === 'MANAGER' && item.managerApproval.status === 'Pending' && item.reportingManagerEmail.toLowerCase() === (user?.email ?? '').toLowerCase()) ||
            ((role === 'HR' || role === 'ADMIN') && item.hrApproval.status === 'Pending')),
      ),
    [cases, role, user?.email],
  );

  const queue = useMemo(() => {
    if (!role || isEmployeeRole(role)) return [];
    return cases.filter((item) => item.employeeId !== user?.employeeId || ['MANAGER', 'HR', 'ADMIN', 'FINANCE'].includes(role));
  }, [cases, role, user?.employeeId]);

  const onFileChange = async (file: File | null) => {
    clearFeedback();
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
      setError('Upload a PDF or Word document for the resignation letter.');
      return;
    }
    if (file.size > MAX_LETTER_BYTES) {
      setError('Resignation letter must be 5 MB or smaller.');
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
    setLetterMeta({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
      dataUrl,
    });
    form.setValue('letterFileName', file.name, { shouldValidate: true });
  };

  const persist = async (submit: boolean) => {
    clearFeedback();
    const valid = await form.trigger();
    if (!valid) return;
    if (submit && !letterMeta.fileName && !exitCase?.letterFileName) {
      setError('Please upload a resignation letter before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const values = form.getValues();
      await runAction({
        action: submit ? 'submit' : 'save',
        ...values,
        letterFileName: letterMeta.fileName || exitCase?.letterFileName,
        letterFileSize: letterMeta.fileSize || exitCase?.letterFileSize,
        letterMimeType: letterMeta.mimeType || exitCase?.letterMimeType,
        letterDataUrl: letterMeta.dataUrl || exitCase?.letterDataUrl,
        designation: 'Software Engineer',
        reportingManagerEmail: 'manager@company.com',
        reportingManagerId: 'usr-mgr-001',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resignation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (action: 'approve' | 'reject', asRole: 'MANAGER' | 'HR') => {
    if (!exitCase) return;
    setSubmitting(true);
    clearFeedback();
    try {
      await runAction({ action, asRole, exitId: exitCase.id, comment: approvalComment });
      setApprovalComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading exit management…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Exit Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Resignation</h1>
            <p className="mt-2 text-sm text-slate-500">Submit and track your resignation through Manager and HR approvals.</p>
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

      {pendingApprovals.length > 0 && (role === 'MANAGER' || role === 'HR' || role === 'ADMIN') && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">
            {pendingApprovals.length} resignation{pendingApprovals.length > 1 ? 's' : ''} awaiting your approval
          </p>
          <p className="mt-1 text-amber-800">
            Open a case from the queue or notifications, then use Manager/HR approve below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pendingApprovals.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectCase(item.id)}
                className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                {item.employeeName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Resignation details</h2>
              <p className="text-sm text-slate-500">
                {locked ? 'Form is locked while approvals are in progress.' : 'Complete the form and upload your resignation letter.'}
              </p>
            </div>
            {locked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Locked
              </span>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Resignation date" error={form.formState.errors.resignationDate?.message}>
              <input
                type="date"
                min={minDate}
                disabled={locked}
                {...form.register('resignationDate')}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
              />
            </Field>
            <Field label="Last working day" error={form.formState.errors.lastWorkingDay?.message}>
              <input
                type="date"
                min={lastWorkingDayMin}
                disabled={locked}
                {...form.register('lastWorkingDay')}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
              />
            </Field>
            <Field label="Notice period (days)" error={form.formState.errors.noticePeriodDays?.message}>
              <input
                type="number"
                disabled={locked}
                {...form.register('noticePeriodDays')}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
              />
            </Field>
            <Field label="Reason category" error={form.formState.errors.reasonCategory?.message}>
              <select
                disabled={locked}
                {...form.register('reasonCategory')}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
              >
                <option value="">Select reason</option>
                {RESIGNATION_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Detailed reason" error={form.formState.errors.reasonDetails?.message} className="mt-4">
            <textarea
              disabled={locked}
              rows={4}
              {...form.register('reasonDetails')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
              placeholder="Share context for your resignation..."
            />
          </Field>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Resignation letter</p>
            <label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center ${locked ? 'pointer-events-none opacity-60' : 'hover:bg-slate-100'}`}>
              <Upload className="h-5 w-5 text-brand-600" />
              <p className="mt-2 text-sm font-medium text-slate-700">Upload PDF or Word file (max 5 MB)</p>
              <p className="mt-1 text-xs text-slate-500">{letterMeta.fileName || exitCase?.letterFileName || 'No file selected'}</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf"
                disabled={locked}
                onChange={(event) => void onFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {!locked &&
            (isEmployeeRole(role) || role === 'MANAGER' || role === 'ADMIN') &&
            (!exitCase || exitCase.employeeId === user?.employeeId) && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => void persist(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void persist(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                Submit resignation
              </button>
            </div>
          )}

          {exitCase && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <ApprovalCard title="Manager approval" record={exitCase.managerApproval} />
              <ApprovalCard title="HR approval" record={exitCase.hrApproval} />
            </div>
          )}

          {(showManagerActions || showHrActions) && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Approval actions</p>
              <textarea
                value={approvalComment}
                onChange={(event) => setApprovalComment(event.target.value)}
                rows={3}
                className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                placeholder="Add an optional comment"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {showManagerActions && (
                  <>
                    <ActionButton tone="emerald" disabled={submitting} onClick={() => void handleDecision('approve', 'MANAGER')} icon={<CheckCircle2 className="h-4 w-4" />} label="Manager approve" />
                    <ActionButton tone="rose" disabled={submitting} onClick={() => void handleDecision('reject', 'MANAGER')} icon={<XCircle className="h-4 w-4" />} label="Manager reject" />
                  </>
                )}
                {showHrActions && (
                  <>
                    <ActionButton tone="emerald" disabled={submitting} onClick={() => void handleDecision('approve', 'HR')} icon={<CheckCircle2 className="h-4 w-4" />} label="HR approve" />
                    <ActionButton tone="rose" disabled={submitting} onClick={() => void handleDecision('reject', 'HR')} icon={<XCircle className="h-4 w-4" />} label="HR reject" />
                  </>
                )}
              </div>
            </div>
          )}

          {showWithdrawal && exitCase && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-sm font-semibold text-amber-900">Request withdrawal</p>
              <p className="mt-1 text-xs text-amber-800">You can request withdrawal before final Manager + HR approval.</p>
              <textarea
                value={withdrawalReason}
                onChange={(event) => setWithdrawalReason(event.target.value)}
                rows={3}
                className="mt-3 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none"
                placeholder="Reason for withdrawal"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  const parsed = withdrawalSchema.safeParse({ reason: withdrawalReason });
                  if (!parsed.success) {
                    setError(parsed.error.issues[0]?.message ?? 'Invalid withdrawal reason');
                    return;
                  }
                  setSubmitting(true);
                  try {
                    await runAction({ action: 'request-withdrawal', exitId: exitCase.id, reason: withdrawalReason });
                    setWithdrawalReason('');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Withdrawal request failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="mt-3 rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Submit withdrawal request
              </button>
            </div>
          )}

          {showWithdrawalReview && exitCase?.withdrawalRequest && (
            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
              <p className="text-sm font-semibold text-violet-900">Pending withdrawal review</p>
              <p className="mt-2 text-sm text-violet-800">{exitCase.withdrawalRequest.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton
                  tone="emerald"
                  disabled={submitting}
                  label="Approve withdrawal"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() =>
                    void runAction({ action: 'review-withdrawal', exitId: exitCase.id, decision: 'Approved' }).catch((err) =>
                      setError(err instanceof Error ? err.message : 'Failed'),
                    )
                  }
                />
                <ActionButton
                  tone="rose"
                  disabled={submitting}
                  label="Reject withdrawal"
                  icon={<XCircle className="h-4 w-4" />}
                  onClick={() =>
                    void runAction({ action: 'review-withdrawal', exitId: exitCase.id, decision: 'Rejected' }).catch((err) =>
                      setError(err instanceof Error ? err.message : 'Failed'),
                    )
                  }
                />
              </div>
            </div>
          )}

          {showReopen && exitCase && (
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                void runAction({ action: 'reopen', exitId: exitCase.id, reason: 'Reopened for resubmission' }).catch((err) =>
                  setError(err instanceof Error ? err.message : 'Reopen failed'),
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              <RotateCcw className="h-4 w-4" />
              Reopen resignation (preserve history)
            </button>
          )}
        </section>

        <aside className="space-y-6">
          <ExitNotifications notifications={notifications} onOpenRelated={selectCase} />

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Version history</h3>
            <div className="mt-4 space-y-3">
              {exitCase?.versions?.length ? (
                exitCase.versions.map((version) => (
                  <div key={`${version.version}-${version.snapshotAt}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                    <p className="font-semibold text-slate-900">Version {version.version}</p>
                    <p className="mt-1 text-slate-500">{version.snapshotReason}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(version.snapshotAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No prior versions. Current version: {exitCase?.version ?? 1}</p>
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Audit log</h3>
            <div className="mt-4">
              <AuditLogList logs={exitCase?.auditLogs ?? []} />
            </div>
          </section>

          {queue.length > 0 && (
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Team / org queue</h3>
              <div className="mt-4 space-y-3">
                {queue.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectCase(item.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      exitCase?.id === item.id ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.employeeName}</p>
                      <ExitStatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.employeeId} · LWD {item.lastWorkingDay || '—'}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

function ApprovalCard({
  title,
  record,
}: {
  title: string;
  record: { status: string; actedByName?: string; comment?: string; actedAt?: string };
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <ExitStatusBadge status={record.status} />
      </div>
      {record.actedByName ? <p className="mt-2 text-xs text-slate-500">By {record.actedByName}</p> : null}
      {record.comment ? <p className="mt-2 text-sm text-slate-600">{record.comment}</p> : null}
      {record.actedAt ? <p className="mt-2 text-xs text-slate-400">{new Date(record.actedAt).toLocaleString()}</p> : null}
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: 'emerald' | 'rose';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
        tone === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
