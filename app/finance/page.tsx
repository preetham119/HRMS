'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeIndianRupee,
  Landmark,
  PieChart,
  TrendingUp,
  Wallet2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

const kpis = [
  {
    label: 'Monthly payroll',
    value: '₹2.84 Cr',
    delta: '+3.2% MoM',
    icon: Wallet2,
  },
  {
    label: 'Operating expenses',
    value: '₹1.16 Cr',
    delta: '-1.4% MoM',
    icon: PieChart,
  },
  {
    label: 'Cash position',
    value: '₹18.7 Cr',
    delta: '+0.8% WoW',
    icon: Landmark,
  },
  {
    label: 'Revenue run-rate',
    value: '₹42.1 Cr',
    delta: '+6.1% QoQ',
    icon: TrendingUp,
  },
];

const highlights = [
  {
    title: 'Payroll readiness',
    detail: 'July cycle locked. 412 slips generated, 3 exceptions pending Finance review.',
    href: '/payroll/salary-slips' as const,
  },
  {
    title: 'Statutory compliance',
    detail: 'PF, ESI, and TDS filings are on track for the current quarter.',
    href: '/payroll' as const,
  },
  {
    title: 'Cost centers',
    detail: 'Engineering and Delivery account for 61% of total headcount cost.',
    href: '/my-org' as const,
  },
];

export default function FinancePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Finance</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Executive finance overview</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              High-level payroll, spend, and cash visibility for the CEO portal
              {user?.name ? ` — ${user.name}` : ''}.
            </p>
          </div>
          <Link
            href="/payroll"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open payroll hub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{kpi.label}</p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-slate-900">{kpi.value}</p>
                <p className="mt-1 text-sm font-medium text-emerald-600">{kpi.delta}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {highlights.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <BadgeIndianRupee className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
              View details
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
