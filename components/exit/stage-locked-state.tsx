'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';

export function StageLockedState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref as any}
          className="mt-6 inline-flex rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
