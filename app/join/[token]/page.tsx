'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Eye, EyeOff, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { readJsonResponse } from '@/lib/api/fetch-json';
import { firstPasswordProblem } from '@/lib/auth/password';
import { PasswordField } from '@/components/auth/password-field';
import { useAuth } from '@/components/providers/auth-provider';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100';

export default function JoinCompanyPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const { user, isReady, refreshUser } = useAuth();

  const [companyName, setCompanyName] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/onboarding/join-info/${token}`);
        const result = await readJsonResponse<{ companyName: string }>(res);
        if (!result.ok) {
          setInfoError(result.error || 'Invalid join link');
          return;
        }
        setCompanyName(result.data?.companyName ?? null);
      } catch {
        setInfoError('Unable to load join link');
      }
    })();
  }, [token]);

  const joinWithSession = async (displayName?: string) => {
    const response = await fetch('/api/onboarding/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, name: displayName }),
    });
    const result = await readJsonResponse(response);
    if (!result.ok) {
      throw new Error(result.error || 'Failed to join');
    }
    await refreshUser();
    router.push('/dashboard');
    router.refresh();
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user && mode === 'signup') {
      const problem = firstPasswordProblem(password);
      if (problem) {
        setError(`Your password is missing: ${problem.toLowerCase()}.`);
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (user) {
        await joinWithSession(name || user.name);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw new Error(signUpError.message);

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (signInError) throw new Error(signInError.message);

        await joinWithSession(name);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (signInError) throw new Error(signInError.message);
        await joinWithSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Join failed');
    } finally {
      setLoading(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:py-12">
      <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-accent-100/60 blur-3xl" />

      <div className="relative mx-auto mb-8 flex max-w-lg items-center justify-center">
        <Link href="/login" aria-label="HRMS Portal">
          <Image
            src="/assets/hrms-portal-logo.svg"
            alt="HRMS Portal"
            width={250}
            height={84}
            priority
            className="h-auto w-[180px] object-contain"
          />
        </Link>
      </div>

      <div className="relative mx-auto w-full max-w-lg">{children}</div>
    </main>
  );

  if (infoError) {
    return shell(
      <div className="rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)]">
        <h1 className="text-xl font-bold text-slate-900">This link doesn&apos;t work</h1>
        <p className="mt-3 text-sm leading-6 text-red-600">{infoError}</p>
        <p className="mt-4 text-sm text-slate-600">
          Ask your administrator for an up-to-date join link.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
        >
          Go to sign in
        </Link>
      </div>,
    );
  }

  if (!companyName || !isReady) {
    return shell(
      <div className="rounded-[28px] border border-slate-100 bg-white p-8 text-center text-sm text-slate-600 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)]">
        Loading your invitation…
      </div>,
    );
  }

  return shell(
    <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)]">
      <div className="border-b border-slate-100 bg-gradient-to-br from-brand-950 to-brand-900 px-8 py-8 text-white">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100">
          <Building2 className="h-3.5 w-3.5" />
          Team invitation
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Join {companyName}</h1>
        <p className="mt-2.5 text-sm leading-6 text-brand-100">
          You&apos;ll join as an Employee. An admin can change your role later.
        </p>
      </div>

      <div className="px-8 py-8">
        {user ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 px-4 py-3.5 text-sm text-slate-700">
              Signed in as <strong className="font-semibold text-slate-900">{user.email}</strong>
            </div>

            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-slate-700">Display name</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={user.name || 'Your name'}
                />
              </div>
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={loading}
              onClick={() => onSubmit({ preventDefault() {} } as React.FormEvent)}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 text-base font-bold text-white shadow-glow transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Joining…' : `Join ${companyName}`}
              {!loading ? <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /> : null}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
              {(
                [
                  ['signup', 'Create account'],
                  ['login', 'I have an account'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    setError(null);
                  }}
                  className={`rounded-xl px-3 py-2.5 transition ${
                    mode === value
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === 'signup' ? (
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-slate-700">Your name</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
              </label>
            ) : null}

            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-slate-700">Work email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            {mode === 'signup' ? (
              <PasswordField value={password} onChange={setPassword} />
            ) : (
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-slate-700">Password</span>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className={`${inputClass} pr-12`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>
            )}

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 text-base font-bold text-white shadow-glow transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Working…' : `Join ${companyName}`}
              {!loading ? <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /> : null}
            </button>
          </form>
        )}
      </div>
    </div>,
  );
}
