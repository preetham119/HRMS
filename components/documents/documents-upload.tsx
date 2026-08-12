'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

type Props = {
  categories: string[];
  onClose: () => void;
  onUploaded?: (payload: any) => void;
};

export default function DocumentsUpload({ categories, onClose, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(categories[0] ?? 'Other');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) setFile(f);
  }, []);

  const onSelectFile = useCallback((f?: File) => {
    if (f) setFile(f);
  }, []);

  const handleChoose = () => inputRef.current?.click();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('category', category);

      // POST to existing API route; server should handle persisting the file
      const res = await fetch('/api/documents', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      onUploaded?.(json);
      onClose();
    } catch (err) {
      // keep simple: log and allow retry
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" className="hidden" onChange={(e) => onSelectFile(e.target.files?.[0] ?? undefined)} />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center"
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 font-medium text-slate-700">Drag and drop files here</p>
        <p className="mt-2 text-sm text-slate-500">PDF, DOC, DOCX, PNG, JPEG up to 10MB</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" onClick={handleChoose} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">Choose file</button>
          <button type="button" onClick={() => { setFile(null); inputRef.current && (inputRef.current.value = ''); }} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">Clear</button>
        </div>
        {file && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-sm">
              <div className="text-sm font-medium text-slate-700">{file.name}</div>
              <button onClick={() => setFile(null)} className="text-slate-400"><X className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white py-2 px-3">
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} type="button" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600">Cancel</button>
          <button onClick={handleUpload} disabled={!file || uploading} type="button" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
