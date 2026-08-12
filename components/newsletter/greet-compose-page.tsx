'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Cake,
  CheckCircle2,
  PartyPopper,
  Send,
  Sparkles,
  Star,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getGreetConfig,
  resolveGreetPerson,
  type GreetType,
} from '@/components/newsletter/greet-utils';

const accentStyles = {
  sky: {
    chip: 'bg-sky-50 text-sky-700 ring-sky-100',
    icon: 'bg-sky-50 text-sky-700',
    button: 'bg-sky-600 hover:bg-sky-700',
    soft: 'border-sky-100 bg-sky-50/70',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
    icon: 'bg-amber-50 text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
    soft: 'border-amber-100 bg-amber-50/70',
  },
  emerald: {
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    icon: 'bg-emerald-50 text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    soft: 'border-emerald-100 bg-emerald-50/70',
  },
} as const;

export function GreetComposePage({ type, personId }: { type: GreetType; personId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const person = resolveGreetPerson(type, personId);
  const config = getGreetConfig(type);
  const theme = accentStyles[config.accent];

  const [message, setMessage] = useState(config.placeholders[0]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const Icon = type === 'birthday' ? Cake : type === 'anniversary' ? Star : UserPlus;
  const senderName = user?.name || user?.email || 'Teammate';

  const preview = useMemo(() => message.trim() || 'Your message will appear here.', [message]);

  if (!person) {
    return (
      <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Person not found</p>
          <p className="mt-2 text-sm text-slate-500">This celebration entry is no longer available.</p>
          <Link href="/newsletter" className="mt-4 inline-flex text-sm font-semibold text-brand-700 underline">
            Back to Newsletter
          </Link>
        </div>
      </main>
    );
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (message.trim().length < 10) {
      setError('Please write at least 10 characters for a meaningful message.');
      return;
    }
    setSent(true);
    window.setTimeout(() => {
      router.push('/newsletter?greeted=1');
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Newsletter
          </Link>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${theme.chip}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.eyebrow}
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 bg-slate-950 px-6 py-6 text-white sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">{config.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{config.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Share a personal note with {person.name}. Your message is delivered as an in-portal greeting
              in this demo experience.
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <form onSubmit={onSubmit} className="space-y-5 border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className={`flex items-center gap-4 rounded-2xl border p-4 ${theme.soft}`}>
                <div className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-white">
                  <img src={person.photo} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900">{person.name}</p>
                  <p className="truncate text-sm text-slate-600">
                    {person.role} · {person.department}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {person.metaLabel}: {person.metaValue}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">Suggested messages</p>
                <div className="flex flex-wrap gap-2">
                  {config.placeholders.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setMessage(template)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Use template
                    </button>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {config.placeholders.map((template) => (
                    <button
                      key={`full-${template}`}
                      type="button"
                      onClick={() => setMessage(template)}
                      className="block w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-left text-xs leading-5 text-slate-600 transition hover:border-slate-200 hover:bg-white"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Your message</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  maxLength={500}
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  placeholder="Write a thoughtful message…"
                />
                <span className="mt-1.5 block text-xs text-slate-400">{message.trim().length}/500</span>
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
              ) : null}

              {sent ? (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Message sent successfully. Returning to Newsletter…
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${theme.button}`}
                  >
                    <Send className="h-4 w-4" />
                    {config.cta}
                  </button>
                  <Link
                    href="/newsletter"
                    className="inline-flex items-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Link>
                </div>
              )}
            </form>

            <aside className="space-y-4 bg-slate-50/80 p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-900">Message preview</p>
              </div>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.icon}`}>
                    <PartyPopper className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">To {person.name}</p>
                    <p className="text-xs text-slate-500">From {senderName}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{preview}</p>
              </article>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
                Keep it warm and professional. Avoid sensitive personal details and keep the note concise.
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
