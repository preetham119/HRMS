import { DOCUMENT_ACCEPTED_MIME_TYPES, getDocumentUploadLimits } from './document-constants';

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAcceptedFileExtension(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  const { extensions } = getDocumentUploadLimits();
  return extensions.includes(extension);
}

export function isAcceptedFileType(file: File): boolean {
  return (
    DOCUMENT_ACCEPTED_MIME_TYPES.includes(file.type as (typeof DOCUMENT_ACCEPTED_MIME_TYPES)[number]) ||
    isAcceptedFileExtension(file.name)
  );
}

export function isFileSizeValid(file: File): boolean {
  return file.size <= getDocumentUploadLimits().maxBytes;
}

export function getDocumentValidationError(file?: File): string | undefined {
  if (!file) return 'Please select a document.';
  const limits = getDocumentUploadLimits();
  if (!isAcceptedFileType(file)) {
    return `Only ${limits.extensions.map((ext) => ext.toUpperCase()).join(', ')} files are allowed.`;
  }
  if (!isFileSizeValid(file)) {
    return `Maximum allowed file size is ${limits.maxUploadMb} MB.`;
  }
  return undefined;
}
