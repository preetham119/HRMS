'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { readJsonResponse } from '@/lib/api/fetch-json';
import { firstPasswordProblem } from '@/lib/auth/password';
import { PasswordField } from '@/components/auth/password-field';
import { useAuth } from '@/components/providers/auth-provider';

export default function EnrollPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const passwordProblem = firstPasswordProblem(password);
    if (passwordProblem) {
      setError(`Your password is missing: ${passwordProblem.toLowerCase()}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/onboarding/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, adminName, email, password }),
      });
      const result = await readJsonResponse(response);
      if (!result.ok) {
        throw new Error(result.error || 'Enrollment failed');
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        throw new Error(signInError.message);
      }

      await refreshUser();
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:py-10">
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-accent-100/60 blur-3xl" />

      <div className="relative mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <Link href="/login" aria-label="Back to sign in">
          <Image
            src="/assets/hrms-portal-logo.svg"
            alt="HRMS Portal"
            width={250}
            height={84}
            priority
            className="h-auto w-[180px] object-contain sm:w-[220px]"
          />
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur hover:border-brand-300 hover:text-brand-700"
        >
          Sign in
        </Link>
      </div>

      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[36px] border border-white bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-brand-950 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              <ShieldCheck className="h-4 w-4" />
              Company enrollment
            </span>
            <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">
              Your HR workspace, ready in minutes.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-brand-100">
              Enroll your company, invite your team with one link, and start managing employee data securely.
            </p>

            <div className="mt-10 space-y-5">
              {[
                'You become the company administrator',
                'A private company workspace is created',
                'Invite employees with a shareable link',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-400/20 text-accent-300">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Get started</p>
                <h2 className="text-2xl font-bold text-slate-900">Enroll your company</h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter your company and administrator details. You can invite employees after enrollment.
            </p>

            <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-2 block font-semibold text-slate-700">Company name</span>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-slate-700">Your name</span>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-slate-700">Work email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </label>

              <div className="sm:col-span-2">
                <PasswordField value={password} onChange={setPassword} />
              </div>

              {error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 text-base font-bold text-white shadow-glow transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              >
                {loading ? 'Enrolling your company…' : 'Enroll company'}
                {!loading ? <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /> : null}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already enrolled?{' '}
              <Link href="/login" className="font-bold text-brand-700 hover:text-brand-800">
                Sign in to your workspace
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
