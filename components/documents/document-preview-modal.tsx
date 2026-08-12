'use client';

import { X } from 'lucide-react';

interface DocumentPreviewModalProps {
  url: string;
  name: string;
  onClose: () => void;
}

export default function DocumentPreviewModal({ url, name, onClose }: DocumentPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Preview document</p>
            <p className="text-sm text-slate-500">{name}</p>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-[540px] bg-slate-900">
          <iframe src={url} className="h-full w-full border-0" title={`Preview ${name}`} />
        </div>
      </div>
    </div>
  );
}
