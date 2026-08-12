'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_FILE_ACCEPT,
  type DocumentCategory,
} from '@/lib/document-constants';
import {
  formatFileSize,
  getDocumentValidationError,
  getFileExtension,
} from '@/lib/document-utils';
import DocumentCategoryDropdown from '@/components/documents/document-category-dropdown';
import FileDropZone from '@/components/documents/file-drop-zone';
import FilePreview from '@/components/documents/file-preview';

export interface DocumentUploadPayload {
  employeeId: string;
  documentCategory: DocumentCategory;
  originalFileName: string;
  extension: string;
  fileSize: number;
  uploadTimestamp: string;
  uploadedBy: string;
  mimeType: string;
  file: File;
}

interface UploadModalProps {
  onClose: () => void;
  onUploaded: (payload: { category: DocumentCategory; document: Record<string, unknown>; file?: File }) => void;
}

const labels = {
  title: 'Add a new document',
  instruction: 'Drag and drop files here',
  hint: 'PDF, DOC, DOCX, PNG, JPG, JPEG up to 10MB',
  selectPlaceholder: 'Select Document Category',
};

export default function DocumentUploadModal({ onClose, onUploaded }: UploadModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | ''>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ file?: string; category?: string }>({});
  const [dragActive, setDragActive] = useState(false);

  const acceptedCategoryOptions = useMemo(() => DOCUMENT_CATEGORIES, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const hasValidFile = Boolean(selectedFile && !getDocumentValidationError(selectedFile));
  const hasValidCategory = Boolean(selectedCategory);
  const canUpload = hasValidFile && hasValidCategory && !isUploading;

  const handleFileChange = useCallback((file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setValidationErrors((prev) => ({ ...prev, file: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleBrowse = () => fileInputRef.current?.click();

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationErrors((prev) => ({ ...prev, file: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleCategoryChange = useCallback((value: DocumentCategory | '') => {
    setSelectedCategory(value);
    setValidationErrors((prev) => ({ ...prev, category: undefined }));
  }, []);

  const validateBeforeUpload = useCallback(() => {
    const fileErrorText = getDocumentValidationError(selectedFile ?? undefined);
    const categoryErrorText = selectedCategory ? undefined : 'Please select a document category.';

    setValidationErrors({ file: fileErrorText, category: categoryErrorText });
    return !fileErrorText && !categoryErrorText;
  }, [selectedFile, selectedCategory]);

  const uploadDocument = useCallback(async () => {
    if (!user) return;
    if (!validateBeforeUpload()) return;
    if (!selectedFile || !selectedCategory) return;

    const payload: DocumentUploadPayload = {
      employeeId: user.employeeId,
      documentCategory: selectedCategory,
      originalFileName: selectedFile.name,
      extension: getFileExtension(selectedFile.name),
      fileSize: selectedFile.size,
      uploadTimestamp: new Date().toISOString(),
      uploadedBy: user.name || user.email,
      mimeType: selectedFile.type,
      file: selectedFile,
    };

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('employeeId', payload.employeeId);
      formData.append('documentCategory', payload.documentCategory);
      formData.append('originalFileName', payload.originalFileName);
      formData.append('extension', payload.extension);
      formData.append('fileSize', `${payload.fileSize}`);
      formData.append('uploadTimestamp', payload.uploadTimestamp);
      formData.append('uploadedBy', payload.uploadedBy);
      formData.append('mimeType', payload.mimeType);
      formData.append('file', payload.file);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.error || 'Unable to upload document. Please try again.';
        throw new Error(errorMessage);
      }

      setUploadProgress(80);
      const uploadedDocument = await response.json();
      setUploadProgress(100);
      onUploaded({ category: selectedCategory, document: uploadedDocument });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected upload error.';
      setValidationErrors((prev) => ({ ...prev, file: message }));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user, selectedFile, selectedCategory, onClose, onUploaded, validateBeforeUpload]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-document-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && canUpload) {
          event.preventDefault();
          uploadDocument();
        }
      }}
    >
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Upload document</p>
            <h2 id="upload-document-title" className="mt-2 text-2xl font-semibold text-slate-900">
              {labels.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close upload modal"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={DOCUMENT_FILE_ACCEPT}
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? undefined)}
          aria-hidden="true"
        />

        <FileDropZone
          accept={DOCUMENT_FILE_ACCEPT}
          disabled={isUploading}
          dragActive={dragActive}
          onBrowse={handleBrowse}
          onChange={handleFileChange}
          onDragActive={setDragActive}
        />

        {selectedFile ? <FilePreview file={selectedFile} onRemove={handleClearFile} /> : null}

        <DocumentCategoryDropdown
          value={selectedCategory}
          options={acceptedCategoryOptions}
          onChange={handleCategoryChange}
          error={validationErrors.category}
        />

        {validationErrors.file ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
            {validationErrors.file}
          </p>
        ) : null}

        {isUploading ? (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-[28px] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={uploadDocument}
            disabled={!canUpload}
            className="inline-flex items-center justify-center rounded-[28px] bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isUploading ? 'Uploading…' : 'Upload'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
