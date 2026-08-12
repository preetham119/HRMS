'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Banknote,
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
  }
> = {
  salary: {
    title: 'text-emerald-600',
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-600',
  },
  tax: {
    title: 'text-violet-600',
    iconWrap: 'bg-violet-50',
    icon: 'text-violet-600',
  },
  benefits: {
    title: 'text-blue-600',
    iconWrap: 'bg-blue-50',
    icon: 'text-blue-600',
  },
  statutory: {
    title: 'text-orange-500',
    iconWrap: 'bg-orange-50',
    icon: 'text-orange-500',
  },
  loans: {
    title: 'text-teal-600',
    iconWrap: 'bg-teal-50',
    icon: 'text-teal-600',
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

function SectionCard({ section }: { section: PayrollSection }) {
  const theme = themes[section.key];

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-6">
      <h2 className={`text-sm font-bold uppercase tracking-[0.08em] ${theme.title}`}>{section.title}</h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {section.items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 py-3.5 first:pt-1 last:pb-0"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconWrap}`}
                >
                  <Icon className={`h-[18px] w-[18px] ${theme.icon}`} strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-slate-900 group-hover:text-slate-950">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-5 text-slate-500">{item.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PayrollHub() {
  const [salary, tax, benefits, statutory, loans] = sections;

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard section={salary} />
          <SectionCard section={tax} />
          <SectionCard section={benefits} />
          <div className="lg:col-span-2">
            <SectionCard section={statutory} />
          </div>
          <SectionCard section={loans} />
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
