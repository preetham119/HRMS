'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HelpDeskOverview from '@/components/help-desk/help-desk-overview';

function HelpDeskHome() {
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('unauthorized') === '1';

  return (
    <div className="space-y-4">
      {isUnauthorized ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Unauthorized access — redirected to IT Service Desk home.
        </div>
      ) : null}
      <HelpDeskOverview />
    </div>
  );
}

export default function HelpDeskPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading IT Service Desk…
        </div>
      }
    >
      <HelpDeskHome />
    </Suspense>
  );
}
