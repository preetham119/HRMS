'use client';

import Link from 'next/link';
import { Cake, Star } from 'lucide-react';
import type { NewsletterEmployee } from '@/components/newsletter/newsletter-data';
import { NewsletterEmptyState, NewsletterSectionCard } from '@/components/newsletter/newsletter-ui';

export function BirthdaysSection({ people }: { people: NewsletterEmployee[] }) {
  return (
    <NewsletterSectionCard
      title="Upcoming Birthdays"
      subtitle="Celebrate teammates this week"
      icon={Cake}
      accent="sky"
    >
      {people.length ? (
        <ul className="space-y-2.5">
          {people.map((person) => (
            <li key={person.id}>
              <article
                aria-label={`Birthday for ${person.name} on ${person.birthday}`}
                className="rounded-xl border border-transparent bg-sky-50/70 px-3 py-2.5 transition hover:border-sky-100 hover:bg-sky-50 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                    <img src={person.photo} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-snug text-slate-900">{person.name}</p>
                    <p className="mt-0.5 break-words text-xs leading-snug text-slate-600">{person.role}</p>
                    <p className="mt-0.5 break-words text-[11px] text-slate-400">{person.department}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-sky-100/80 pt-2.5">
                  <div>
                    <p className="text-xs font-semibold text-sky-700">{person.birthday}</p>
                    <p className="text-[11px] text-slate-400">{person.id}</p>
                  </div>
                  <Link
                    href={`/newsletter/greet/birthday/${person.id}`}
                    className="inline-flex shrink-0 items-center rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
                  >
                    Wish
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <NewsletterEmptyState
          icon={Cake}
          title="No birthdays this week"
          description="Check back next week for upcoming celebrations."
        />
      )}
    </NewsletterSectionCard>
  );
}

export function AnniversariesSection({ people }: { people: NewsletterEmployee[] }) {
  return (
    <NewsletterSectionCard
      title="Work Anniversaries"
      subtitle="Years of contribution"
      icon={Star}
      accent="amber"
    >
      {people.length ? (
        <ul className="divide-y divide-slate-100">
          {people.map((person) => (
            <li key={person.id} className="py-3 first:pt-0 last:pb-0">
              <article
                aria-label={`Work anniversary for ${person.name} on ${person.anniversary}`}
                className="rounded-xl px-1 transition hover:bg-amber-50/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-2 ring-white">
                    <Star className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-snug text-slate-900">{person.name}</p>
                    <p className="mt-0.5 break-words text-xs leading-snug text-slate-600">{person.role}</p>
                    <p className="mt-0.5 break-words text-[11px] text-slate-400">{person.department}</p>
                  </div>
                  <div className="shrink-0 rounded-xl bg-amber-50 px-2.5 py-1.5 text-center">
                    <p className="text-base font-semibold leading-none text-slate-900">{person.anniversaryYears}</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">Years</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-amber-100/80 pt-2.5">
                  <p className="text-xs text-slate-500">{person.anniversary}</p>
                  <Link
                    href={`/newsletter/greet/anniversary/${person.id}`}
                    className="inline-flex shrink-0 items-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
                  >
                    Wish
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <NewsletterEmptyState
          icon={Star}
          title="No anniversaries this week"
          description="Milestones will appear here as they approach."
        />
      )}
    </NewsletterSectionCard>
  );
}
