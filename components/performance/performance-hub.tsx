'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { toAppraisalPersona } from '@/lib/appraisal/permissions';
import { AdminPerformance } from './admin-performance';
import { CeoPerformance } from './ceo-performance';
import { EmployeePerformance } from './employee-performance';
import { HrPerformance } from './hr-performance';
import { ManagerPerformance } from './manager-performance';

const subtitles = {
  employee: 'Track your goals and complete your self appraisal.',
  manager: 'Review your team\'s submitted appraisals.',
  hr: 'Manage appraisal cycles and view organisation progress.',
  admin: 'Provide the administrative review and recommendations.',
  leadership: 'Make final leadership decisions for appraisals.',
} as const;

export function PerformanceHub() {
  const { user, isReady } = useAuth();
  if (!isReady) return <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading performance workspace…</div>;
  if (!user) return <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500">Sign in to access performance.</div>;

  const actor = { id: user.id, employeeId: user.employeeId, email: user.email, name: user.name ?? user.email, role: user.role, department: user.department };
  const persona = toAppraisalPersona(user.role);
  const View = persona === 'employee' ? EmployeePerformance : persona === 'manager' ? ManagerPerformance : persona === 'hr' ? HrPerformance : persona === 'admin' ? AdminPerformance : CeoPerformance;

  return (
    <main className="space-y-6">
      <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">People operations</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Performance</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitles[persona]}</p>
      </header>
      <View actor={actor} />
    </main>
  );
}
