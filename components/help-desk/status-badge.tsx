import { PRIORITY_STYLES, STATUS_STYLES } from '@/lib/help-desk/constants';
import type { TicketPriority, TicketStatus } from '@/lib/help-desk/types';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', PRIORITY_STYLES[priority])}>
      {priority}
    </span>
  );
}
