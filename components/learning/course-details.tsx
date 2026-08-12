'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  getCourseById,
  getLessonsForCourse,
  getQuizzesForCourse,
  getRelatedCourses,
} from '@/lib/learning/data';
import { isCourseEnrolled, toggleCourseEnrollment } from '@/lib/learning/enrollments';
import { LearningPageHeader } from '@/components/learning/learning-page-header';
import { RelatedCourses, RelatedQuizzes } from '@/components/learning/related-content';
import { cn } from '@/lib/utils';

export default function CourseDetails({ courseId }: { courseId: number }) {
  const course = getCourseById(courseId);
  const lessons = getLessonsForCourse(courseId);
  const courseQuizzes = getQuizzesForCourse(courseId);
  const relatedCourses = getRelatedCourses(courseId, 3);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    setIsEnrolled(isCourseEnrolled(courseId));
  }, [courseId]);

  const enrollmentLabel = useMemo(() => (isEnrolled ? 'Enrolled' : 'Enroll'), [isEnrolled]);

  if (!course) {
    return (
      <div className="space-y-6">
        <LearningPageHeader title="Course not found" description="This course may have been removed or is unavailable." />
        <Link href="/learning/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>
      </div>
    );
  }

  const handleEnroll = () => {
    setIsEnrolled(toggleCourseEnrollment(courseId));
  };

  return (
    <div className="space-y-6">
      <LearningPageHeader
        title={course.title}
        description={course.description}
        action={
          <Link
            href="/learning/courses"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
        }
      />

      <div className={cn('rounded-[32px] border p-8 shadow-sm', course.tone.bg, course.tone.border)}>
        <p className={cn('text-sm font-semibold uppercase tracking-[0.25em]', course.tone.accent)}>{course.category}</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-800">{course.title}</h2>
        <p className="mt-3 max-w-2xl text-slate-600">{course.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Lessons</h3>
          <div className="mt-4 space-y-3">
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                    <p className="text-sm text-slate-500">
                      {lesson.type} • {lesson.duration}
                      {lesson.completed ? ' • Completed' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      'rounded-2xl px-3 py-2 text-sm font-semibold text-white',
                      course.tone.button,
                      course.tone.buttonHover,
                    )}
                  >
                    Open
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950">
                Lessons for this course will appear here soon.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Course overview</h3>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Level: {course.level}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Duration: {course.duration}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Enrolled: {course.enrolled + (isEnrolled ? 1 : 0)}
          </p>
          <button
            type="button"
            onClick={handleEnroll}
            className={`mt-6 w-full rounded-2xl px-4 py-3 font-semibold text-white ${
              isEnrolled ? 'bg-accent-600 hover:bg-accent-700' : 'bg-slate-900 hover:bg-slate-700'
            }`}
          >
            {enrollmentLabel}
          </button>
          {courseQuizzes[0] ? (
            isEnrolled ? (
              <Link
                href={`/learning/quizzes/${courseQuizzes[0].id}`}
                className={cn(
                  'mt-3 flex w-full items-center justify-center rounded-2xl px-4 py-3 font-semibold text-white',
                  course.tone.button,
                  course.tone.buttonHover,
                )}
              >
                Start quiz
              </Link>
            ) : (
              <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 dark:bg-slate-950">
                Enroll in this course to unlock the quiz.
              </p>
            )
          ) : null}
        </section>
      </div>

      <RelatedQuizzes quizzes={courseQuizzes} title="Course quizzes" />
      <RelatedCourses courses={relatedCourses} />
    </div>
  );
}
