'use client';

import { statusLabel } from '@/lib/appraisal/permissions';
import { cn } from '@/lib/utils';

export function AppraisalStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'completed' && 'bg-emerald-50 text-emerald-700',
        status === 'under_manager_review' && 'bg-sky-50 text-sky-700',
        status === 'under_admin_review' && 'bg-violet-50 text-violet-700',
        status === 'under_leadership_review' && 'bg-amber-50 text-amber-800',
        (status === 'draft' || status === 'returned') && 'bg-slate-100 text-slate-700',
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
