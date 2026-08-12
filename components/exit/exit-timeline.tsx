'use client';

import { Check, Circle, Lock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTimelineSteps } from '@/lib/exit/permissions';
import type { ExitCase } from '@/lib/exit/types';

export function ExitTimeline({ exitCase }: { exitCase: ExitCase | null }) {
  const steps = getTimelineSteps(exitCase);

  return (
    <ol className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => {
        const done = step.state === 'done';
        const current = step.state === 'current';
        const error = step.state === 'error';
        const locked = step.state === 'locked';

        return (
          <li
            key={step.key}
            className={cn(
              'relative rounded-2xl border p-4 transition',
              done && 'border-emerald-200 bg-emerald-50/60',
              current && 'border-brand-200 bg-brand-50/70 shadow-sm',
              error && 'border-rose-200 bg-rose-50/70',
              locked && 'border-slate-200 bg-slate-50 opacity-70',
              !done && !current && !error && !locked && 'border-slate-200 bg-white',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  done && 'bg-emerald-600 text-white',
                  current && 'bg-brand-600 text-white',
                  error && 'bg-rose-600 text-white',
                  locked && 'bg-slate-300 text-slate-600',
                  !done && !current && !error && !locked && 'bg-slate-200 text-slate-600',
                )}
              >
                {done ? <Check className="h-4 w-4" /> : error ? <X className="h-4 w-4" /> : locked ? <Lock className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {index + 1}. {step.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
