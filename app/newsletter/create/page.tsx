import { Suspense } from 'react';
import { CreateNewsletterForm } from '@/components/newsletter/create-newsletter-form';

function CreateFallback() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Loading composer…</p>
    </div>
  );
}

export default function CreateNewsletterPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <Suspense fallback={<CreateFallback />}>
        <CreateNewsletterForm />
      </Suspense>
    </main>
  );
}
