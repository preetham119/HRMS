'use client';

import { FileText, ImageIcon, Trash2 } from 'lucide-react';
import { formatFileSize, getFileExtension } from '@/lib/document-utils';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

function getIcon(fileName: string) {
  const extension = getFileExtension(fileName);
  if (['png', 'jpg', 'jpeg'].includes(extension)) return ImageIcon;
  return FileText;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const Icon = getIcon(file.name);

  return (
    <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{file.name}</p>
            <p className="text-sm text-slate-500">Size: {formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
      </div>
    </div>
  );
}
