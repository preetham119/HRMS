'use client';

import React, { useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  accept: string;
  disabled?: boolean;
  dragActive: boolean;
  onChange: (file: File) => void;
  onBrowse: () => void;
  onDragActive: (active: boolean) => void;
}

export default function FileDropZone({
  accept,
  disabled = false,
  dragActive,
  onChange,
  onBrowse,
  onDragActive,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) onChange(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      onDragActive(false);
      const file = event.dataTransfer.files?.[0];
      if (file) onChange(file);
    },
    [onChange, onDragActive],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      onDragActive(true);
    },
    [onDragActive],
  );

  const handleDragLeave = useCallback(() => {
    onDragActive(false);
  }, [onDragActive]);

  const handleBrowseClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
      onBrowse();
    }
  }, [disabled, onBrowse]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={handleBrowseClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleBrowseClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mt-6 rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition ${
          dragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
      >
        <Upload className="mx-auto h-9 w-9 text-brand-600" />
        <p className="mt-4 text-lg font-semibold text-slate-900">Drag and drop files here</p>
        <p className="mt-2 text-sm text-slate-500">PDF, DOC, DOCX, PNG, JPG, JPEG up to 10MB</p>
        <p className="mt-4 text-sm font-medium text-brand-600 underline underline-offset-4">Click to browse files</p>
      </div>
    </div>
  );
}
