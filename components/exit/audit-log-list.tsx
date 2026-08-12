'use client';

import { History } from 'lucide-react';
import type { AuditLogEntry } from '@/lib/exit/types';

export function AuditLogList({ logs }: { logs: AuditLogEntry[] }) {
  if (!logs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No audit activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.slice(0, 12).map((log) => (
        <div key={log.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <History className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {log.actorRole}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{log.details}</p>
              <p className="mt-2 text-xs text-slate-400">
                {log.actorName} · {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
