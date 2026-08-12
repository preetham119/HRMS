import { getDocumentsSettings } from '@/lib/settings/registry';

export const DOCUMENT_CATEGORIES = [
  'Personal Documents',
  'Educational Documents',
  'Professional Certifications',
  'Previous Employment',
  'Current Employment',
  'Company Policies',
  'Financial Documents',
  'PF Documents',
  'ESIC Documents',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'] as const;
export type DocumentExtension = (typeof DOCUMENT_ACCEPTED_EXTENSIONS)[number];

export const DOCUMENT_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
] as const;

/** Fallback when settings are unavailable (SSR / first paint). */
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_FILE_ACCEPT = DOCUMENT_ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(',');

export function getDocumentUploadLimits() {
  const docs = getDocumentsSettings();
  const extensions = docs.allowedTypes.length
    ? docs.allowedTypes
    : [...DOCUMENT_ACCEPTED_EXTENSIONS];
  return {
    maxBytes: docs.maxUploadMb * 1024 * 1024,
    maxUploadMb: docs.maxUploadMb,
    extensions,
    accept: extensions.map((ext) => `.${ext}`).join(','),
  };
}

export interface DocumentItem {
  id: number;
  name: string;
  category: DocumentCategory;
  uploadDate: string;
  expiryDate: string;
  uploadedBy: string;
  status: 'Verified' | 'Pending Review' | 'Rejected' | 'Uploaded';
  type: string;
  sizeInBytes: number;
  mimeType: string;
  extension: string;
  employeeId: string;
  uploadTimestamp: string;
}
