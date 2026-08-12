'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LearningDashboard from '@/components/learning/learning-dashboard';

function LearningHome() {
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('unauthorized') === '1';

  return (
    <div className="space-y-4">
      {isUnauthorized ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Unauthorized access — redirected to Learning home.
        </div>
      ) : null}
      <LearningDashboard />
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading learning center…
        </div>
      }
    >
      <LearningHome />
    </Suspense>
  );
}
