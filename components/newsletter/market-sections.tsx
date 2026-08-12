'use client';

import Link from 'next/link';
import {
  Award,
  BookOpen,
  CalendarDays,
  HeartPulse,
  Lightbulb,
  Megaphone,
  ScrollText,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import {
  announcements,
  funFact,
  learningHighlights,
  newJoiners,
  policyUpdates,
  quickLinks,
  recognitions,
  spotlights,
  upcomingEvents,
  wellnessTips,
} from '@/components/newsletter/newsletter-data';
import { NewsletterSectionCard } from '@/components/newsletter/newsletter-ui';

export function NewJoinersSection() {
  return (
    <NewsletterSectionCard title="Welcome New Joiners" subtitle="Say hello to recent hires" icon={UserPlus} accent="emerald">
      <ul className="space-y-2.5">
        {newJoiners.map((person) => (
          <li
            key={person.id}
            className="rounded-xl border border-emerald-50 bg-emerald-50/50 px-3 py-2.5 transition hover:bg-emerald-50"
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
            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-emerald-100/80 pt-2.5">
              <p className="text-[11px] font-medium text-emerald-700">Joined {person.joinedOn}</p>
              <Link
                href={`/newsletter/greet/welcome/${person.id}`}
                className="inline-flex shrink-0 items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Welcome
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </NewsletterSectionCard>
  );
}

export function SpotlightsSection() {
  return (
    <NewsletterSectionCard title="Employee Spotlights" subtitle="Peers making an impact" icon={Sparkles} accent="indigo">
      <div className="space-y-3">
        {spotlights.map((item) => (
          <article key={item.id} className="rounded-xl border border-indigo-50 bg-indigo-50/40 p-3.5">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white">
                <img src={item.photo} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{item.role}</p>
                <p className="mt-2 text-sm leading-5 text-slate-700">&ldquo;{item.quote}&rdquo;</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </NewsletterSectionCard>
  );
}

export function EventsSection() {
  return (
    <NewsletterSectionCard title="Upcoming Events" subtitle="Mark your calendar" icon={CalendarDays} accent="teal">
      <ul className="space-y-2.5">
        {upcomingEvents.map((event) => (
          <li key={event.id} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 transition hover:border-teal-100 hover:bg-teal-50/40">
            <p className="text-sm font-semibold text-slate-900">{event.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              {event.date} · {event.time}
            </p>
            <p className="mt-0.5 text-xs font-medium text-teal-700">{event.location}</p>
          </li>
        ))}
      </ul>
    </NewsletterSectionCard>
  );
}

export function AnnouncementsSection({
  items = announcements,
}: {
  items?: Array<{
    id: string;
    title: string;
    body: string;
    tone: 'info' | 'warning';
    date: string;
    attachment?: {
      fileName: string;
      fileSize: number;
      mimeType: string;
      dataUrl: string;
    };
  }>;
}) {
  return (
    <NewsletterSectionCard title="Important Announcements" subtitle="Need-to-know updates" icon={Megaphone} accent="rose">
      {items.length ? (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border px-3.5 py-3 ${
                item.tone === 'warning'
                  ? 'border-amber-100 bg-amber-50/70'
                  : 'border-rose-50 bg-rose-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <span className="shrink-0 text-[11px] font-medium text-slate-400">{item.date}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{item.body}</p>
              {item.attachment ? (
                <a
                  href={item.attachment.dataUrl}
                  download={item.attachment.fileName}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 hover:underline"
                >
                  Download {item.attachment.fileName}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-rose-100 bg-rose-50/40 px-3 py-6 text-center text-xs text-slate-500">
          No announcements yet. Publish one from Create Newsletter.
        </p>
      )}
    </NewsletterSectionCard>
  );
}

export function PolicyUpdatesSection({
  items = policyUpdates,
}: {
  items?: Array<{
    id: string;
    title: string;
    category: string;
    effective: string;
    body?: string;
  }>;
}) {
  return (
    <NewsletterSectionCard title="Policy & HR Updates" subtitle="Effective dates and changes" icon={ScrollText} accent="slate">
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.category}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                {item.effective}
              </span>
            </div>
            {item.body ? <p className="mt-1.5 text-xs leading-5 text-slate-600 line-clamp-2">{item.body}</p> : null}
          </li>
        ))}
      </ul>
    </NewsletterSectionCard>
  );
}

export function LearningSection({
  items = learningHighlights,
}: {
  items?: Array<{
    id: string;
    title: string;
    meta: string;
    seats: string;
    body?: string;
  }>;
}) {
  return (
    <NewsletterSectionCard title="Learning & Training" subtitle="Grow your skills this month" icon={BookOpen} accent="indigo">
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-100 px-3.5 py-3 transition hover:border-indigo-100 hover:bg-indigo-50/40">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <span className="shrink-0 text-[11px] font-semibold text-indigo-700">{item.seats}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
            {item.body ? <p className="mt-1.5 text-xs leading-5 text-slate-600 line-clamp-2">{item.body}</p> : null}
          </li>
        ))}
      </ul>
    </NewsletterSectionCard>
  );
}

export function QuickLinksSection() {
  return (
    <NewsletterSectionCard title="Quick Links" subtitle="Jump to common actions" icon={Sparkles} accent="sky">
      <div className="grid grid-cols-2 gap-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </NewsletterSectionCard>
  );
}

export function RecognitionSection() {
  return (
    <NewsletterSectionCard title="Recognition & Awards" subtitle="Celebrating excellence" icon={Award} accent="amber">
      <ul className="space-y-2.5">
        {recognitions.map((item) => (
          <li key={item.id} className="rounded-xl border border-amber-100 bg-amber-50/50 px-3.5 py-3">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-xs text-slate-600">{item.recipient}</p>
            <p className="mt-0.5 text-[11px] font-medium text-amber-700">{item.month}</p>
          </li>
        ))}
      </ul>
    </NewsletterSectionCard>
  );
}

export function FunFactSection() {
  return (
    <NewsletterSectionCard title="Did You Know" subtitle="A quick culture insight" icon={Lightbulb} accent="amber">
      <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-4">
        <p className="text-sm font-semibold text-slate-900">{funFact.title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{funFact.body}</p>
      </div>
    </NewsletterSectionCard>
  );
}

export function WellnessSection() {
  return (
    <NewsletterSectionCard title="Wellness Corner" subtitle="Small habits, big impact" icon={HeartPulse} accent="rose">
      <ul className="space-y-2.5">
        {wellnessTips.map((tip) => (
          <li key={tip.id} className="rounded-xl border border-rose-50 bg-rose-50/40 px-3.5 py-3">
            <p className="text-sm font-semibold text-slate-900">{tip.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{tip.body}</p>
          </li>
        ))}
      </ul>
    </NewsletterSectionCard>
  );
}
