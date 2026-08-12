import { Suspense } from 'react';
import NewsletterDashboard from '@/components/newsletter/NewsletterDashboard';

function NewsletterFallback() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
      Loading newsletter hub…
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<NewsletterFallback />}>
          <NewsletterDashboard />
        </Suspense>
      </div>
    </main>
  );
}
