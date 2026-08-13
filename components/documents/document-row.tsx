'use client';

import { Download, Eye, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/document-utils';
import type { DocumentItem } from '@/app/documents/page';

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

interface DocumentRowProps {
  document: DocumentItem;
  onPreview?: (document: DocumentItem) => void;
  onDownload?: (document: DocumentItem) => void;
}

export default function DocumentRow({ document, onPreview, onDownload }: DocumentRowProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{document.name}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-white px-2.5 py-1">Uploaded: {document.uploadDate}</span>
            <span className="rounded-full bg-white px-2.5 py-1">{formatFileSize(document.sizeInBytes ?? 0)}</span>
            <span className="rounded-full bg-white px-2.5 py-1">{document.type}</span>
            <span className="rounded-full bg-white px-2.5 py-1">By: {document.uploadedBy}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPreview?.(document)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <Eye className="mr-2 inline-block h-4 w-4" /> Preview
        </button>
        <button
          type="button"
          onClick={() => onDownload?.(document)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <Download className="mr-2 inline-block h-4 w-4" /> Download
        </button>
      </div>
    </div>
  );
}
