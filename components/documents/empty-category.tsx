'use client';

import { Inbox } from 'lucide-react';

export default function EmptyCategory() {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
      <Inbox className="h-5 w-5 text-slate-400" />
      <div>
        <p className="font-medium text-slate-700">No documents uploaded.</p>
        <p className="text-sm text-slate-500">Upload a document to see it listed here.</p>
      </div>
    </div>
  );
}
