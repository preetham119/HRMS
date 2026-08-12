'use client';

import { useState } from 'react';
import { LearningPageHeader } from '@/components/learning/learning-page-header';

/** HR / Admin role — mapped from empL&D Admin console. */
export default function HrConsole() {
  const [courseName, setCourseName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <LearningPageHeader
        eyebrow="HR"
        title="Learning admin console"
        description="Manage courses, trainers, and employee learning access."
      />

      {message ? (
        <div className="rounded-[24px] border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create course</h2>
          <input
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Course title"
          />
          <button
            type="button"
            onClick={() => {
              if (!courseName.trim()) return;
              setMessage(`Course "${courseName.trim()}" published.`);
              setCourseName('');
            }}
            className="mt-4 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Publish course
          </button>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Manage users</h2>
          <input
            value={userEmail}
            onChange={(event) => setUserEmail(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            placeholder="User email"
          />
          <button
            type="button"
            onClick={() => {
              if (!userEmail.trim()) return;
              setMessage(`Access granted to ${userEmail.trim()}.`);
              setUserEmail('');
            }}
            className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Grant access
          </button>
        </section>
      </div>
    </div>
  );
}
