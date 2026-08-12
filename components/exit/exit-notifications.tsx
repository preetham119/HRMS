'use client';

import { Bell } from 'lucide-react';
import type { ExitNotification } from '@/lib/exit/types';

export function ExitNotifications({
  notifications,
  onOpenRelated,
}: {
  notifications: ExitNotification[];
  onOpenRelated?: (exitId: string) => void;
}) {
  if (!notifications.length) return null;

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-sky-700" />
        <p className="text-sm font-semibold text-sky-900">Notifications</p>
      </div>
      <div className="space-y-2">
        {notifications.slice(0, 5).map((item) => {
          const clickable = Boolean(item.relatedExitId && onOpenRelated);
          const content = (
            <>
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{item.message}</p>
              {clickable ? <p className="mt-1 text-xs font-semibold text-sky-700">Open case →</p> : null}
            </>
          );

          if (clickable && item.relatedExitId) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenRelated?.(item.relatedExitId!)}
                className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-left transition hover:border-sky-200 hover:bg-sky-50/50"
              >
                {content}
              </button>
            );
          }

          return (
            <div key={item.id} className="rounded-xl border border-sky-100 bg-white px-3 py-2.5">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
