import { NextRequest, NextResponse } from 'next/server';
import { DOCUMENT_CATEGORIES } from '@/lib/document-constants';
import { AuthError, requireMembership, requirePrisma } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/admin';

function formatDoc(doc: {
  id: string;
  name: string;
  category: string;
  uploadDate: Date;
  expiryDate: Date | null;
  uploadedBy: string;
  verificationStatus: string;
  fileType: string;
  storagePath: string;
  mimeType: string | null;
  sizeInBytes: number | null;
  employeeId: string;
}) {
  return {
    id: doc.id,
    name: doc.name,
    category: doc.category,
    uploadDate: doc.uploadDate.toISOString().split('T')[0],
    expiryDate: doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : '-',
    uploadedBy: doc.uploadedBy,
    status: doc.verificationStatus,
    type: doc.fileType,
    sizeInBytes: doc.sizeInBytes ?? 0,
    mimeType: doc.mimeType ?? '',
    extension: doc.fileType.toLowerCase(),
    employeeId: doc.employeeId,
    uploadTimestamp: doc.uploadDate.toISOString(),
    storagePath: doc.storagePath,
  };
}

export async function GET() {
  try {
    const membership = await requireMembership();
    const db = requirePrisma();
    const docs = await db.documentRecord.findMany({
      where: {
        companyId: membership.companyId,
        employeeId: membership.employeeId,
      },
      orderBy: { uploadDate: 'desc' },
    });
    return NextResponse.json(docs.map(formatDoc));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const membership = await requireMembership();
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please select a valid file.' }, { status: 400 });
    }

    const documentCategory = String(formData.get('documentCategory') || '');
    const originalFileName = String(formData.get('originalFileName') || file.name);
    const extension = String(formData.get('extension') || originalFileName.split('.').pop() || 'bin');

    if (!DOCUMENT_CATEGORIES.includes(documentCategory as (typeof DOCUMENT_CATEGORIES)[number])) {
      return NextResponse.json({ error: 'Invalid document category.' }, { status: 400 });
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: 'Maximum allowed file size is 10 MB.' }, { status: 400 });
    }

    const safeName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${membership.companyId}/${membership.employeeId}/${Date.now()}-${safeName}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const admin = createServiceClient();

    const { error: uploadError } = await admin.storage.from('documents').upload(storagePath, bytes, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message || 'Upload failed' }, { status: 500 });
    }

    const db = requirePrisma();
    const created = await db.documentRecord.create({
      data: {
        companyId: membership.companyId,
        employeeId: membership.employeeId,
        name: originalFileName,
        category: documentCategory,
        uploadedBy: membership.name,
        verificationStatus: 'Uploaded',
        fileType: extension.toUpperCase(),
        storagePath,
        mimeType: file.type || null,
        sizeInBytes: file.size,
      },
    });

    return NextResponse.json(formatDoc(created), { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Documents POST error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
