'use client';

import type { DocumentCategory } from '@/lib/document-constants';

interface DocumentCategoryDropdownProps {
  value: DocumentCategory | '';
  options: readonly DocumentCategory[];
  onChange: (category: DocumentCategory | '') => void;
  error?: string;
}

export default function DocumentCategoryDropdown({
  value,
  options,
  onChange,
  error,
}: DocumentCategoryDropdownProps) {
  return (
    <div className="mt-6">
      <label htmlFor="document-category" className="mb-2 block text-sm font-medium text-slate-700">
        Document Category *
      </label>
      <select
        id="document-category"
        value={value}
        onChange={(event) => onChange(event.target.value as DocumentCategory | '')}
        className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        aria-required="true"
        aria-invalid={Boolean(error)}
      >
        <option value="">Select Document Category</option>
        {options.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
