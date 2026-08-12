'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star } from 'lucide-react';
import { COURSE_CATEGORIES, COURSES, getFeaturedQuizzes } from '@/lib/learning/data';
import { LearningPageHeader } from '@/components/learning/learning-page-header';
import { RelatedQuizzes } from '@/components/learning/related-content';
import { cn } from '@/lib/utils';

export default function CoursesCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof COURSE_CATEGORIES)[number]>('All');
  const featuredQuizzes = useMemo(() => getFeaturedQuizzes(4), []);

  const filteredCourses = useMemo(
    () =>
      COURSES.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'All' || course.category === category;
        return matchesSearch && matchesCategory;
      }),
    [category, search],
  );

  return (
    <div className="space-y-6">
      <LearningPageHeader
        title="Course catalog"
        description="Browse, filter, and continue your learning journey."
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 sm:w-56"
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as (typeof COURSE_CATEGORIES)[number])}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            >
              {COURSE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Link
              href={`/learning/courses/${course.id}`}
              className="group block rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={cn('rounded-2xl border p-4', course.tone.bg, course.tone.border)}>
                <p className={cn('text-xs font-semibold uppercase tracking-[0.25em]', course.tone.accent)}>
                  {course.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-800 dark:text-slate-900">{course.title}</h2>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>{course.duration}</span>
                <span>•</span>
                <span>{course.level}</span>
                <span>•</span>
                <span>{course.enrolled} learners</span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className={cn('inline-flex items-center gap-1 text-sm font-semibold', course.tone.accent)}>
                  <Star className="h-4 w-4 fill-current" />
                  {course.rating}
                </span>
                <span
                  className={cn(
                    'rounded-2xl px-4 py-2 text-sm font-semibold text-white transition',
                    course.tone.button,
                    course.tone.buttonHover,
                  )}
                >
                  Launch course
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No courses match your filters.
        </div>
      ) : null}

      <RelatedQuizzes quizzes={featuredQuizzes} title="Related quizzes" />
    </div>
  );
}
