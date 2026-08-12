'use client';

import { useState, type ChangeEvent } from 'react';
import { ASSIGNMENTS } from '@/lib/learning/data';
import { LearningPageHeader } from '@/components/learning/learning-page-header';

export default function AssignmentsPanel() {
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<Record<number, string>>({});

  const handleFileChange = (assignmentId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFiles((current) => ({ ...current, [assignmentId]: file }));
  };

  const handleUpload = (assignmentId: number) => {
    const file = selectedFiles[assignmentId];
    if (!file) return;
    setUploadedFiles((current) => ({ ...current, [assignmentId]: file.name }));
    setStatus((current) => ({ ...current, [assignmentId]: 'Submitted' }));
  };

  return (
    <div className="space-y-6">
      <LearningPageHeader
        title="Assignments"
        description="Upload assignments and review feedback from your trainer."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {ASSIGNMENTS.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{assignment.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Status: {status[assignment.id] ?? assignment.status}
            </p>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-center dark:border-slate-700">
              <input
                type="file"
                onChange={(event) => handleFileChange(assignment.id, event)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => handleUpload(assignment.id)}
                className="mt-3 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Upload assignment
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              {uploadedFiles[assignment.id]
                ? `Uploaded file: ${uploadedFiles[assignment.id]}`
                : assignment.feedback || 'Feedback will appear here once reviewed.'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
