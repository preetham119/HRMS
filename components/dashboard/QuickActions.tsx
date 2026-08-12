'use client';

import { FC } from 'react';
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
    <div className="flex gap-4 justify-start max-w-3xl mx-auto">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <a
            key={a.title}
            href={a.href}
            className="flex-1 min-w-[0] rounded-[14px] h-[52px] bg-white text-slate-800 flex items-center gap-3 justify-center transition transform hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="inline-flex items-center justify-center rounded-md bg-blue-50 p-2">
              <Icon className="h-5 w-5 text-[#2563EB]" />
            </span>
            <span className="font-semibold text-[16px]">{a.title}</span>
          </a>
        );
      })}
    </div>
  );
};

export default QuickActions;