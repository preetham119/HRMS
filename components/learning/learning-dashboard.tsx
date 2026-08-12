'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, BookOpen, Clock3 } from 'lucide-react';
import { COMPLETION_STATS, COURSES, LEARNING_NOTIFICATIONS, WEEKLY_HOURS } from '@/lib/learning/data';
import { LearningPageHeader } from '@/components/learning/learning-page-header';

const maxHours = Math.max(...WEEKLY_HOURS.map((item) => item.hours));

export default function LearningDashboard() {
  return (
    <div className="space-y-6">
      <LearningPageHeader
        title="Learning center"
        description="Track enrolled courses, training milestones, and upcoming deadlines in one place."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Learning Hours', value: '24.8h', subtitle: '+12% from last week', icon: Clock3 },
          { title: 'Courses Enrolled', value: '7', subtitle: '3 in progress', icon: BookOpen },
          { title: 'Certificates', value: '2', subtitle: '1 pending review', icon: Award },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.subtitle}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Learning Hours</h3>
            <span className="text-sm text-slate-500">This week</span>
          </div>
          <div className="flex h-56 items-end gap-3">
            {WEEKLY_HOURS.map((item) => (
              <div key={item.name} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end rounded-2xl bg-slate-50 px-2 pb-0 dark:bg-slate-950">
                  <div
                    className="w-full rounded-t-2xl bg-brand-600 transition-all"
                    style={{ height: `${(item.hours / maxHours) * 100}%`, minHeight: '12%' }}
                    title={`${item.hours}h`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{item.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Learning Completion</h3>
          <div className="mt-6 space-y-4">
            {COMPLETION_STATS.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recommended Courses</h3>
            <Link href="/learning/courses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {COURSES.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                  <p className="text-sm text-slate-500">{course.category}</p>
                </div>
                <Link
                  href={`/learning/courses/${course.id}`}
                  className="rounded-2xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h3>
          <div className="mt-4 space-y-3">
            {LEARNING_NOTIFICATIONS.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
