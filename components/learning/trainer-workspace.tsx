'use client';

import { useState } from 'react';
import { LearningPageHeader } from '@/components/learning/learning-page-header';

/** Manager role — mapped from empL&D Trainer workspace. */
export default function TrainerWorkspace() {
  const [lessonTitle, setLessonTitle] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <LearningPageHeader
        eyebrow="Trainer"
        title="Trainer workspace"
        description="Create course content, lessons, and quizzes for your team."
      />

      {message ? (
        <div className="rounded-[24px] border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upload lesson</h2>
          <input
            value={lessonTitle}
            onChange={(event) => setLessonTitle(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Lesson title"
          />
          <button
            type="button"
            onClick={() => {
              if (!lessonTitle.trim()) return;
              setMessage(`Lesson "${lessonTitle.trim()}" queued for upload.`);
              setLessonTitle('');
            }}
            className="mt-4 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Upload resource
          </button>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create quiz</h2>
          <input
            value={quizTitle}
            onChange={(event) => setQuizTitle(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Quiz title"
          />
          <button
            type="button"
            onClick={() => {
              if (!quizTitle.trim()) return;
              setMessage(`Quiz "${quizTitle.trim()}" draft created.`);
              setQuizTitle('');
            }}
            className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Create quiz
          </button>
        </section>
      </div>
    </div>
  );
}
