'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function NoAccessPage() {
  const { logout } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">No company access</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Ask an admin for a join link, or enroll a new company.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/enroll" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Enroll your company
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
