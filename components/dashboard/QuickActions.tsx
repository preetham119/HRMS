'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Calendar, Upload, FileText } from 'lucide-react';

type ActionItem = {
  title: string;
  href: string;
  icon: typeof Calendar;
};

const QuickActions: FC = () => {
  const actions: ActionItem[] = [
    { title: 'Apply Leave', href: '/leave?apply=1', icon: Calendar },
    { title: 'Upload Document', href: '/documents', icon: Upload },
    { title: 'View Payslip', href: '/payroll/salary-slips', icon: FileText },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.title}
            href={action.href as any}
            className="flex h-12 items-center justify-center gap-3 rounded-2xl bg-white px-4 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2">
              <Icon className="h-4 w-4 text-[#2563EB]" />
            </span>
            <span className="text-sm font-semibold sm:text-[15px]">{action.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
