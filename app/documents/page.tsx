'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, FileText, Filter, Plus, Search } from 'lucide-react';
import DocumentUploadModal from '@/components/documents/document-upload-modal';
import DocumentAccordion from '@/components/documents/document-accordion';
import DocumentPreviewModal from '@/components/documents/document-preview-modal';
import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@/lib/document-constants';

export interface DocumentItem {
  id: number;
  name: string;
  category: DocumentCategory;
  uploadDate: string;
  expiryDate: string;
  uploadedBy: string;
  status: 'Verified' | 'Pending Review' | 'Uploaded';
  type: string;
  sizeInBytes?: number;
  mimeType?: string;
  extension?: string;
  employeeId?: string;
  uploadTimestamp?: string;
  file?: File;
  downloadUrl?: string;
}

const documents: DocumentItem[] = [
  {
    id: 1,
    name: 'Aadhaar Card',
    category: 'Personal Documents',
    uploadDate: '2025-01-10',
    expiryDate: '-',
    uploadedBy: 'Rajesh Kumar',
    status: 'Verified',
    type: 'PDF',
    sizeInBytes: 240000,
    mimeType: 'application/pdf',
    extension: 'pdf',
    employeeId: 'EMP001',
    uploadTimestamp: '2025-01-10T09:00:00.000Z',
    downloadUrl: '/assets/Reference image.png',
  },
  {
    id: 2,
    name: 'Offer Letter',
    category: 'Current Employment',
    uploadDate: '2024-01-12',
    expiryDate: '-',
    uploadedBy: 'HR Admin',
    status: 'Verified',
    type: 'PDF',
    sizeInBytes: 210000,
    mimeType: 'application/pdf',
    extension: 'pdf',
    employeeId: 'EMP001',
    uploadTimestamp: '2024-01-12T09:00:00.000Z',
    downloadUrl: '/assets/Reference image.png',
  },
  {
    id: 3,
    name: 'Appointment Letter',
    category: 'Current Employment',
    uploadDate: '2024-01-12',
    expiryDate: '-',
    uploadedBy: 'HR Admin',
    status: 'Pending Review',
    type: 'PDF',
    sizeInBytes: 210000,
    mimeType: 'application/pdf',
    extension: 'pdf',
    employeeId: 'EMP001',
    uploadTimestamp: '2024-01-12T09:00:00.000Z',
    downloadUrl: '/assets/Reference image.png',
  },
  {
    id: 4,
    name: 'PAN Card',
    category: 'Personal Documents',
    uploadDate: '2024-03-02',
    expiryDate: '-',
    uploadedBy: 'Rajesh Kumar',
    status: 'Verified',
    type: 'PNG',
    sizeInBytes: 300000,
    mimeType: 'image/png',
    extension: 'png',
    employeeId: 'EMP001',
    uploadTimestamp: '2024-03-02T09:00:00.000Z',
    downloadUrl: '/assets/ISO.jpg',
  },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [documentsState, setDocumentsState] = useState<DocumentItem[]>(documents);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filtered = useMemo(
    () => documentsState.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())),
    [documentsState, search],
  );

  const categoryCounts = useMemo(
    () =>
      DOCUMENT_CATEGORIES.reduce((acc, category) => {
        acc[category] = documentsState.filter((item) => item.category === category).length;
        return acc;
      }, {} as Record<DocumentCategory, number>),
    [documentsState],
  );

  const [expandedCategories, setExpandedCategories] = useState<Record<DocumentCategory, boolean>>(
    DOCUMENT_CATEGORIES.reduce((acc, category) => ({ ...acc, [category]: false }), {} as Record<DocumentCategory, boolean>),
  );

  const handleUploaded = useCallback(
    (payload: { category: DocumentCategory; document: Partial<DocumentItem> | Record<string, unknown>; file?: File }) => {
      const documentPayload = payload.document as Partial<DocumentItem>;
      const downloadUrl = payload.file ? URL.createObjectURL(payload.file) : documentPayload.downloadUrl ?? undefined;
      const uploadedDocument: DocumentItem = {
        id: typeof documentPayload.id === 'number' ? documentPayload.id : Date.now(),
        name: typeof documentPayload.name === 'string' ? documentPayload.name : 'New Document',
        category: (documentPayload.category ?? payload.category) as DocumentCategory,
        uploadDate: typeof documentPayload.uploadDate === 'string' ? documentPayload.uploadDate : new Date().toISOString().slice(0, 10),
        expiryDate: typeof documentPayload.expiryDate === 'string' ? documentPayload.expiryDate : '-',
        uploadedBy: typeof documentPayload.uploadedBy === 'string' ? documentPayload.uploadedBy : 'You',
        status: (documentPayload.status as DocumentItem['status']) ?? 'Uploaded',
        type: typeof documentPayload.type === 'string' ? documentPayload.type : 'PDF',
        sizeInBytes: typeof documentPayload.sizeInBytes === 'number' ? documentPayload.sizeInBytes : 0,
        mimeType: typeof documentPayload.mimeType === 'string' ? documentPayload.mimeType : 'application/pdf',
        extension: typeof documentPayload.extension === 'string' ? documentPayload.extension : 'pdf',
        employeeId: typeof documentPayload.employeeId === 'string' ? documentPayload.employeeId : 'EMP001',
        uploadTimestamp: typeof documentPayload.uploadTimestamp === 'string' ? documentPayload.uploadTimestamp : new Date().toISOString(),
        file: payload.file,
        downloadUrl,
      };

      setDocumentsState((current) => [...current, uploadedDocument]);
      setToastMessage('Document uploaded successfully.');
      setExpandedCategories((current) => ({ ...current, [payload.category]: true }));
      setShowUpload(false);
      window.setTimeout(() => setToastMessage(null), 4000);
    },
    [],
  );

  const toggleCategory = useCallback((category: DocumentCategory) => {
    setExpandedCategories((current) => ({ ...current, [category]: !current[category] }));
  }, []);

  const previewUrlRef = useRef<string | null>(null);

  const handlePreviewDocument = useCallback((documentItem: DocumentItem) => {
    const url = documentItem.downloadUrl ?? (documentItem.file ? URL.createObjectURL(documentItem.file) : null);

    if (!url) {
      setToastMessage('Preview unavailable for this document.');
      window.setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    if (previewUrlRef.current && previewUrlRef.current !== url) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch {
        // ignore if already revoked
      }
    }

    previewUrlRef.current = url;
    setPreviewUrl(url);
    setSelectedDocument(documentItem);
  }, []);

  const handleDownloadDocument = useCallback((documentItem: DocumentItem) => {
    const url = documentItem.downloadUrl ?? (documentItem.file ? URL.createObjectURL(documentItem.file) : null);

    if (!url) {
      setToastMessage('Download unavailable for this document.');
      window.setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const link = window.document.createElement('a');
    link.href = url;
    link.download = documentItem.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);

    if (!documentItem.downloadUrl && documentItem.file) {
      URL.revokeObjectURL(url);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch {
          // ignore if already revoked
        }
      }
    };
  }, []);

  const closePreview = useCallback(() => {
    setSelectedDocument(null);
    setPreviewUrl(null);
    if (previewUrlRef.current) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch {
        // ignore if already revoked
      }
      previewUrlRef.current = null;
    }
  }, []);

  const documentsByCategory = useMemo(
    () =>
      DOCUMENT_CATEGORIES.reduce((acc, category) => {
        acc[category] = documentsState.filter((document) => document.category === category);
        return acc;
      }, {} as Record<DocumentCategory, DocumentItem[]>),
    [documentsState],
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Document center</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Secure document management</h1>
              <p className="mt-2 text-sm text-slate-500">Upload, preview, replace, and download documents without leaving the portal.</p>
            </div>
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-medium text-white">
              <Plus className="h-4 w-4" />
              Upload new
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
              <Search className="h-4 w-4" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Search documents" />
            </label>
            <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </motion.section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Document categories</h2>
            <div className="mt-6 space-y-4">
              {DOCUMENT_CATEGORIES.map((category) => (
                <DocumentAccordion
                  key={category}
                  category={category}
                  documents={documentsByCategory[category]}
                  expanded={expandedCategories[category]}
                  onToggle={() => toggleCategory(category)}
                  onPreview={handlePreviewDocument}
                  onDownload={handleDownloadDocument}
                />
              ))}
            </div>
          </motion.aside>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent uploads</h2>
                <p className="mt-1 text-sm text-slate-500">Latest records available for verification and download.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              {filtered.map((document) => (
                <div key={document.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-brand-600/10 p-3 text-brand-700">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{document.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{document.category}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-white px-2.5 py-1">Uploaded: {document.uploadDate}</span>
                          <span className="rounded-full bg-white px-2.5 py-1">Expires: {document.expiryDate}</span>
                          <span className="rounded-full bg-white px-2.5 py-1">By: {document.uploadedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handlePreviewDocument(document)}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreviewDocument(document)}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadDocument(document)}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">{document.type}</span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">{document.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600">Replace</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </section>
      </div>

      {toastMessage ? (
        <div className="fixed inset-x-4 top-6 z-50 rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-lg text-sm text-emerald-800 sm:left-auto sm:right-6 sm:max-w-sm" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}

      {showUpload && (
        <DocumentUploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}

      {previewUrl && selectedDocument ? (
        <DocumentPreviewModal url={previewUrl} name={selectedDocument.name} onClose={closePreview} />
      ) : null}
    </main>
  );
}
