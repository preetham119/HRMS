'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Banknote,
  ChevronDown,
  ChevronRight,
  FileLock2,
  FilePenLine,
  FileText,
  Gift,
  IndianRupee,
  Landmark,
  PieChart,
  ScrollText,
  Settings2,
  Shield,
  TrendingUp,
  UserRound,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeKey = 'salary' | 'tax' | 'benefits' | 'statutory' | 'loans';

type PayrollLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

type PayrollSection = {
  key: ThemeKey;
  title: string;
  items: PayrollLink[];
};

const themes: Record<
  ThemeKey,
  {
    title: string;
    iconWrap: string;
    icon: string;
    headerBg: string;
    border: string;
  }
> = {
  salary: {
    title: 'text-emerald-700',
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-600',
    headerBg: 'hover:bg-emerald-50/70',
    border: 'border-emerald-100',
  },
  tax: {
    title: 'text-violet-700',
    iconWrap: 'bg-violet-50',
    icon: 'text-violet-600',
    headerBg: 'hover:bg-violet-50/70',
    border: 'border-violet-100',
  },
  benefits: {
    title: 'text-blue-700',
    iconWrap: 'bg-blue-50',
    icon: 'text-blue-600',
    headerBg: 'hover:bg-blue-50/70',
    border: 'border-blue-100',
  },
  statutory: {
    title: 'text-orange-600',
    iconWrap: 'bg-orange-50',
    icon: 'text-orange-500',
    headerBg: 'hover:bg-orange-50/70',
    border: 'border-orange-100',
  },
  loans: {
    title: 'text-teal-700',
    iconWrap: 'bg-teal-50',
    icon: 'text-teal-600',
    headerBg: 'hover:bg-teal-50/70',
    border: 'border-teal-100',
  },
};

const sections: PayrollSection[] = [
  {
    key: 'salary',
    title: 'SALARY',
    items: [
      {
        title: 'Salary Slips',
        description: 'View and download your salary slips.',
        href: '/payroll/salary-slips',
        icon: FileText,
      },
      {
        title: 'Current Salary',
        description: 'View your current salary details.',
        href: '/payroll/current-salary',
        icon: Banknote,
      },
      {
        title: 'Previous Salary',
        description: 'View your salary history.',
        href: '/payroll/previous-salary',
        icon: ScrollText,
      },
    ],
  },
  {
    key: 'tax',
    title: 'TAX',
    items: [
      {
        title: 'Form 16',
        description: 'Download your Form 16.',
        href: '/payroll/form-16',
        icon: FileLock2,
      },
      {
        title: 'Tax Declaration',
        description: 'Declare investments and save tax.',
        href: '/payroll/tax-declaration',
        icon: FilePenLine,
      },
      {
        title: 'Tax Projection',
        description: 'View your tax projection and plans.',
        href: '/payroll/tax-projection',
        icon: TrendingUp,
      },
    ],
  },
  {
    key: 'benefits',
    title: 'BENEFITS',
    items: [
      {
        title: 'Reimbursements',
        description: 'View your reimbursements.',
        href: '/payroll/reimbursements',
        icon: Wallet,
      },
      {
        title: 'Bonus',
        description: 'View your bonus details.',
        href: '/payroll/bonus',
        icon: Gift,
      },
      {
        title: 'Incentives',
        description: 'View your incentives.',
        href: '/payroll/incentives',
        icon: Award,
      },
      {
        title: 'Variable Pay',
        description: 'View your variable pay details.',
        href: '/payroll/variable-pay',
        icon: PieChart,
      },
    ],
  },
  {
    key: 'statutory',
    title: 'STATUTORY',
    items: [
      {
        title: 'PF',
        description: 'View your Provident Fund details.',
        href: '/payroll/pf',
        icon: Settings2,
      },
      {
        title: 'ESI',
        description: 'View your ESI details.',
        href: '/payroll/esi',
        icon: Shield,
      },
      {
        title: 'Professional Tax',
        description: 'View your Professional Tax details.',
        href: '/payroll/professional-tax',
        icon: UserRound,
      },
      {
        title: 'TDS',
        description: 'View your TDS details.',
        href: '/payroll/tds',
        icon: IndianRupee,
      },
    ],
  },
  {
    key: 'loans',
    title: 'LOANS',
    items: [
      {
        title: 'Salary Advance',
        description: 'Request or view salary advance.',
        href: '/payroll/salary-advance',
        icon: Banknote,
      },
      {
        title: 'Loan Status',
        description: 'View your loan details and status.',
        href: '/payroll/loan-status',
        icon: Landmark,
      },
    ],
  },
];

function SectionCard({
  section,
  open,
  onToggle,
}: {
  section: PayrollSection;
  open: boolean;
  onToggle: () => void;
}) {
  const theme = themes[section.key];

  return (
    <section
      className={cn(
        'w-full rounded-2xl border bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]',
        theme.border,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left transition sm:px-6',
          theme.headerBg,
          open && 'rounded-b-none',
        )}
      >
        <span className={cn('text-sm font-bold uppercase tracking-[0.08em]', theme.title)}>
          {section.title}
        </span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500">
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')}
          />
        </span>
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <ul className="divide-y divide-slate-100 px-4 pb-4 sm:px-6">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href as any}
                    className="group flex items-center gap-3 py-3.5 first:pt-1 last:pb-0"
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        theme.iconWrap,
                      )}
                    >
                      <Icon className={cn('h-[18px] w-[18px]', theme.icon)} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-slate-900 group-hover:text-slate-950">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-sm leading-5 text-slate-500">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PayrollHub() {
  const [openSections, setOpenSections] = useState<Record<ThemeKey, boolean>>({
    salary: true,
    tax: true,
    benefits: true,
    statutory: true,
    loans: true,
  });

  const toggleSection = (key: ThemeKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Payroll</h1>
            <p className="mt-1 text-sm text-slate-500">Browse salary, tax, benefits, and more.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setOpenSections({
                  salary: true,
                  tax: true,
                  benefits: true,
                  statutory: true,
                  loans: true,
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() =>
                setOpenSections({
                  salary: false,
                  tax: false,
                  benefits: false,
                  statutory: false,
                  loans: false,
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <SectionCard
              key={section.key}
              section={section}
              open={openSections[section.key]}
              onToggle={() => toggleSection(section.key)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export const PAYROLL_SECTION_META = Object.fromEntries(
  sections.flatMap((section) =>
    section.items.map((item) => [
      item.href.replace('/payroll/', ''),
      {
        title: item.title,
        description: item.description,
        sectionTitle: section.title,
        theme: section.key,
      },
    ]),
  ),
) as Record<
  string,
  {
    title: string;
    description: string;
    sectionTitle: string;
    theme: ThemeKey;
  }
>;
