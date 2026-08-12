'use client';

import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import { PAYROLL_SECTION_META } from '@/components/payroll/payroll-hub';

const themeStyles = {
  salary: {
    title: 'text-emerald-600',
    panel: 'border-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  tax: {
    title: 'text-violet-600',
    panel: 'border-violet-100',
    badge: 'bg-violet-50 text-violet-700',
  },
  benefits: {
    title: 'text-blue-600',
    panel: 'border-blue-100',
    badge: 'bg-blue-50 text-blue-700',
  },
  statutory: {
    title: 'text-orange-500',
    panel: 'border-orange-100',
    badge: 'bg-orange-50 text-orange-700',
  },
  loans: {
    title: 'text-teal-600',
    panel: 'border-teal-100',
    badge: 'bg-teal-50 text-teal-700',
  },
} as const;

export function PayrollDetailPage({ slug }: { slug: string }) {
  const meta = PAYROLL_SECTION_META[slug];

  if (!meta) {
    return (
      <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Page not found</p>
          <Link href="/payroll" className="mt-4 inline-flex text-sm font-semibold text-slate-700 underline">
            Back to Payroll
          </Link>
        </div>
      </main>
    );
  }

  const theme = themeStyles[meta.theme];

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/payroll"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Payroll
        </Link>

        <section className={`rounded-[28px] border bg-white p-6 shadow-sm sm:p-8 ${theme.panel}`}>
          <p className={`text-sm font-bold uppercase tracking-[0.08em] ${theme.title}`}>{meta.sectionTitle}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{meta.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{meta.description}</p>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
              <Construction className="h-3.5 w-3.5" />
              Coming soon
            </span>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              This payroll section is wired into the landing page. Detailed records and workflows will
              be available here next.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
