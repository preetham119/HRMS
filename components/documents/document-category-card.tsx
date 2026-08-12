'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DocumentCategory } from '@/lib/document-constants';

interface DocumentCategoryCardProps {
  category: DocumentCategory;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function DocumentCategoryCard({ category, count, expanded, onToggle, children }: DocumentCategoryCardProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:border-brand-400 hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-expanded={expanded}
        aria-controls={`category-panel-${category.replace(/\s+/g, '-')}`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-900">{category}</span>
          <span className="text-sm text-slate-500">{count} document{count === 1 ? '' : 's'}</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <div
        id={`category-panel-${category.replace(/\s+/g, '-')}`}
        className={`overflow-hidden transition-[max-height,padding] duration-300 ${expanded ? 'max-h-[1200px] pb-5' : 'max-h-0 pb-0'}`}
      >
        <div className={`px-5 ${expanded ? 'pt-0' : 'pt-0'}`}>{children}</div>
      </div>
    </div>
  );
}
