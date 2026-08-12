'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Course, Quiz } from '@/lib/learning/types';
import { canAttemptQuiz } from '@/lib/learning/enrollments';
import { DEFAULT_LEARNING_TONE } from '@/lib/learning/tones';
import { cn } from '@/lib/utils';

export function RelatedCourses({ courses }: { courses: Course[] }) {
  if (courses.length === 0) return null;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Related courses</h3>
      <p className="mt-1 text-sm text-slate-500">Continue with similar learning paths.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/learning/courses/${course.id}`}
            className={cn('rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm', course.tone.bg, course.tone.border)}
          >
            <p className={cn('text-xs font-semibold uppercase tracking-[0.2em]', course.tone.accent)}>{course.category}</p>
            <p className="mt-2 font-semibold text-slate-800">{course.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              {course.level} • {course.duration}
            </p>
            <span className={cn('mt-3 inline-flex text-sm font-semibold', course.tone.accent)}>Launch course →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function RelatedQuizzes({ quizzes, title = 'Related quizzes' }: { quizzes: Quiz[]; title?: string }) {
  const [enrolledByCourse, setEnrolledByCourse] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const next: Record<number, boolean> = {};
    quizzes.forEach((quiz) => {
      next[quiz.courseId] = canAttemptQuiz(quiz.courseId);
    });
    setEnrolledByCourse(next);
  }, [quizzes]);

  if (quizzes.length === 0) return null;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">Enroll in the course first to attempt its quiz.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {quizzes.map((quiz) => {
          const tone = quiz.tone ?? DEFAULT_LEARNING_TONE;
          const enrolled = enrolledByCourse[quiz.courseId] ?? false;
          return (
            <Link
              key={quiz.id}
              href={enrolled ? `/learning/quizzes/${quiz.id}` : `/learning/courses/${quiz.courseId}`}
              className={cn('rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm', tone.bg, tone.border)}
            >
              <p className={cn('font-semibold', tone.accent)}>{quiz.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {quiz.questions.length} questions • Pass {quiz.passingScore}%
              </p>
              <span
                className={cn(
                  'mt-3 inline-flex rounded-xl px-3 py-1.5 text-xs font-semibold text-white',
                  enrolled ? tone.button : 'bg-slate-400',
                )}
              >
                {enrolled ? 'Start quiz' : 'Enroll to unlock'}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
