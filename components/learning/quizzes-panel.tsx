'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import {
  QUIZZES,
  getCourseById,
  getFeaturedCourses,
  getQuizById,
  getRelatedQuizzes,
} from '@/lib/learning/data';
import { canAttemptQuiz } from '@/lib/learning/enrollments';
import { DEFAULT_LEARNING_TONE } from '@/lib/learning/tones';
import { LearningPageHeader } from '@/components/learning/learning-page-header';
import { RelatedCourses, RelatedQuizzes } from '@/components/learning/related-content';
import { cn } from '@/lib/utils';

export default function QuizzesPanel({ quizId }: { quizId?: number }) {
  const router = useRouter();
  const selectedQuiz = quizId ? getQuizById(quizId) : null;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentReady, setEnrollmentReady] = useState(false);
  const [enrolledByCourse, setEnrolledByCourse] = useState<Record<number, boolean>>({});
  const tone = selectedQuiz?.tone ?? DEFAULT_LEARNING_TONE;
  const relatedQuizzes = selectedQuiz ? getRelatedQuizzes(selectedQuiz.id, 3) : [];
  const featuredCourses = useMemo(() => getFeaturedCourses(3), []);
  const linkedCourse = selectedQuiz ? getCourseById(selectedQuiz.courseId) : null;

  useEffect(() => {
    if (selectedQuiz) {
      setIsEnrolled(canAttemptQuiz(selectedQuiz.courseId));
      setEnrollmentReady(true);
      return;
    }

    const next: Record<number, boolean> = {};
    QUIZZES.forEach((quiz) => {
      next[quiz.courseId] = canAttemptQuiz(quiz.courseId);
    });
    setEnrolledByCourse(next);
    setEnrollmentReady(true);
  }, [selectedQuiz]);

  const score = useMemo(() => {
    if (!selectedQuiz) return 0;
    return selectedQuiz.questions.reduce(
      (total, question) => total + (answers[question.id] === question.answer ? 1 : 0),
      0,
    );
  }, [answers, selectedQuiz]);

  const percentage = selectedQuiz ? Math.round((score / selectedQuiz.questions.length) * 100) : 0;
  const passed = selectedQuiz ? percentage >= selectedQuiz.passingScore : false;

  useEffect(() => {
    if (!submitted) return;
    const timer = window.setTimeout(() => {
      router.push('/learning/quizzes');
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [router, submitted]);

  const handleSubmit = () => {
    if (!selectedQuiz || !canAttemptQuiz(selectedQuiz.courseId)) return;
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <LearningPageHeader
        title={selectedQuiz ? selectedQuiz.title : 'Technology quizzes'}
        description={
          selectedQuiz
            ? `Test your knowledge in ${selectedQuiz.title}.`
            : 'Enroll in a course before attempting its quiz.'
        }
        action={
          selectedQuiz ? (
            <Link
              href="/learning/quizzes"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to quiz list
            </Link>
          ) : undefined
        }
      />

      {selectedQuiz ? (
        <>
          {!enrollmentReady ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
              Checking enrollment…
            </div>
          ) : !isEnrolled ? (
            <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Enrollment required</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    You must enroll in{' '}
                    <span className="font-semibold">{linkedCourse?.title ?? 'the related course'}</span> before
                    attempting this quiz.
                  </p>
                  {linkedCourse ? (
                    <Link
                      href={`/learning/courses/${linkedCourse.id}`}
                      className={cn(
                        'mt-4 inline-flex rounded-2xl px-4 py-2.5 text-sm font-semibold text-white',
                        tone.button,
                        tone.buttonHover,
                      )}
                    >
                      Go to course & enroll
                    </Link>
                  ) : (
                    <Link
                      href="/learning/courses"
                      className="mt-4 inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Browse courses
                    </Link>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className={cn('rounded-[24px] border p-5', tone.bg, tone.border)}>
                <h2 className={cn('text-xl font-semibold', tone.accent)}>{selectedQuiz.title}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedQuiz.questions.length} questions • Passing score {selectedQuiz.passingScore}%
                </p>
                {linkedCourse ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Related course:{' '}
                    <Link href={`/learning/courses/${linkedCourse.id}`} className={cn('font-semibold', tone.accent)}>
                      {linkedCourse.title}
                    </Link>
                  </p>
                ) : null}
              </div>

              <div className="mt-6 space-y-4">
                {selectedQuiz.questions.map((question) => (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{question.prompt}</p>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, index) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answers[question.id] === index}
                            disabled={submitted}
                            onChange={() => setAnswers((value) => ({ ...value, [question.id]: index }))}
                            className="accent-brand-600"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-200">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!submitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={cn('mt-6 rounded-2xl px-4 py-3 font-semibold text-white', tone.button, tone.buttonHover)}
                >
                  Submit quiz
                </button>
              ) : (
                <div className={cn('mt-6 rounded-2xl border p-4', tone.bg, tone.border)}>
                  <p className="font-semibold text-slate-900">Result: {percentage}%</p>
                  <p className={`text-sm font-medium ${passed ? 'text-accent-600' : 'text-rose-600'}`}>
                    {passed ? 'Pass' : 'Fail'}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">Returning to the Quizzes tab…</p>
                  <Link
                    href="/learning/quizzes"
                    className={cn('mt-4 inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white', tone.button)}
                  >
                    Back to quizzes
                  </Link>
                </div>
              )}
            </section>
          )}

          <RelatedQuizzes quizzes={relatedQuizzes} />
          {linkedCourse ? <RelatedCourses courses={[linkedCourse]} /> : null}
        </>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {QUIZZES.map((quiz) => {
              const quizTone = quiz.tone ?? DEFAULT_LEARNING_TONE;
              const course = getCourseById(quiz.courseId);
              const enrolled = enrolledByCourse[quiz.courseId] ?? false;
              return (
                <Link
                  key={quiz.id}
                  href={enrolled ? `/learning/quizzes/${quiz.id}` : `/learning/courses/${quiz.courseId}`}
                  className={cn(
                    'block rounded-[28px] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md',
                    quizTone.bg,
                    quizTone.border,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className={cn('text-xl font-semibold', quizTone.accent)}>{quiz.title}</h2>
                    {!enrolled ? <Lock className="mt-1 h-4 w-4 shrink-0 text-slate-400" /> : null}
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {quiz.questions.length} questions • Passing score {quiz.passingScore}%
                  </p>
                  {course ? <p className="mt-2 text-xs text-slate-500">From: {course.title}</p> : null}
                  <div
                    className={cn(
                      'mt-6 inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white',
                      enrolled ? quizTone.button : 'bg-slate-400',
                    )}
                  >
                    {enrolled ? 'Start quiz' : 'Enroll to unlock'}
                  </div>
                </Link>
              );
            })}
          </div>

          <RelatedCourses courses={featuredCourses} />
        </>
      )}
    </div>
  );
}
