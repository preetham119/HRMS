'use client';

import { WORKFLOW_STEPS } from '@/lib/appraisal/types';
import { computeWorkflowPercent } from '@/lib/appraisal/store';
import { cn } from '@/lib/utils';

export function WorkflowBar({ status }: { status: string }) {
  const percent = computeWorkflowPercent(status);
  const activeIndex =
    status === 'draft' || status === 'returned'
      ? 0
      : status === 'under_manager_review'
        ? 1
        : status === 'under_admin_review'
          ? 2
          : status === 'under_leadership_review'
            ? 3
            : status === 'completed'
              ? 4
              : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workflow</p>
        <p className="text-sm font-semibold text-slate-700">{percent}%</p>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const done = index < activeIndex || status === 'completed';
          const active = index === activeIndex && status !== 'completed';
          return (
            <div
              key={step.id}
              className={cn(
                'rounded-xl px-3 py-2 text-center text-xs font-semibold',
                done && 'bg-emerald-50 text-emerald-700',
                active && 'bg-slate-900 text-white',
                !done && !active && 'bg-white text-slate-500 ring-1 ring-slate-200',
              )}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
