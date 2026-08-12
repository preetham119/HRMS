'use client';

import { cn } from '@/lib/utils';
import type { ExitStatus } from '@/lib/exit/types';
import { statusTone } from '@/lib/exit/store';

const toneClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
};

export function ExitStatusBadge({ status }: { status: ExitStatus | string }) {
  const tone = statusTone(status);
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', toneClasses[tone] ?? toneClasses.slate)}>
      {status}
    </span>
  );
}
