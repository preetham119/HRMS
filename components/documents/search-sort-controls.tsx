'use client';

import type { DocumentCategory } from '@/lib/document-constants';
import type { SortOption } from './document-row';

interface SearchSortControlsProps {
  category: DocumentCategory;
  searchText: string;
  sortOption: SortOption;
  onSearchTextChange: (value: string) => void;
  onSortOptionChange: (value: SortOption) => void;
}

export default function SearchSortControls({
  searchText,
  sortOption,
  onSearchTextChange,
  onSortOptionChange,
}: SearchSortControlsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 shadow-sm">
        <span className="text-slate-500">Search</span>
        <input
          type="search"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="Search documents..."
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        <span className="text-slate-500">Sort</span>
        <select
          value={sortOption}
          onChange={(event) => onSortOptionChange(event.target.value as SortOption)}
          className="bg-transparent text-sm text-slate-900 outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </label>
    </div>
  );
}
