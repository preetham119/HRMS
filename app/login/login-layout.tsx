'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { useCallback, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Bell,
  Headphones,
} from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid work email'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const featureCards = [
  {
    id: 1,
    title: 'My Profile',
    description: 'View and update your personal details',
    icon: Users,
    border: 'border-blue-100',
    bg: 'bg-blue-50/80',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 2,
    title: 'Leave Management',
    description: 'Apply, track and manage your leaves',
    icon: Calendar,
    border: 'border-emerald-100',
    bg: 'bg-emerald-50/80',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 3,
    title: 'Documents',
    description: 'Upload and manage your important documents',
    icon: FileText,
    border: 'border-violet-100',
    bg: 'bg-violet-50/80',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    id: 4,
    title: 'Payroll',
    description: 'Access your salary and payslips',
    upcoming: true,
    icon: DollarSign,
    border: 'border-amber-100',
    bg: 'bg-amber-50/90',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 5,
    title: 'Announcements',
    description: 'Stay updated with company news',
    icon: Bell,
    border: 'border-pink-100',
    bg: 'bg-pink-50/90',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    id: 6,
    title: 'HR Support',
    description: 'Raise requests and get timely assistance',
    icon: Headphones,
    border: 'border-sky-100',
    bg: 'bg-sky-50/80',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
];

export default function LoginLayout() {
  const router = useRouter();
  const { login, isReady } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({ email: '', password: '', remember: true });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const setField = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => {
      if (!previous[key]) return previous;
      const copy = { ...previous };
      delete copy[key];
      return copy;
    });
  }, []);

  const handleBlurValidate = (field: keyof FormValues) => {
    const result = schema.partial().safeParse({ [field]: values[field] });
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path[0] === field);
      if (issue) setFieldErrors((prev) => ({ ...prev, [field]: issue.message }));
    } else {
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<keyof FormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormValues;
        errors[key] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-3xl bg-slate-100 p-8 text-center shadow-lg">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col overflow-hidden px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex w-full items-center justify-between pb-6 lg:pb-8">
          <div className="flex items-center gap-4">
            <Image src="/assets/desidea-logo.png" alt="Desidea logo" width={130} height={40} className="h-auto w-[130px] object-contain" />
            <span className="text-sm font-medium text-slate-500">Software Technologies</span>
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Building Innovative Digital Experiences</p>
        </div>

        <div className="flex flex-1 flex-col gap-8 overflow-hidden lg:flex-row lg:gap-10">
          <section className="relative flex w-full flex-col rounded-[44px] bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] lg:w-[52%] lg:p-12">
            <div className="absolute -left-24 top-16 h-40 w-40 rounded-full bg-[#E6F0FF] blur-3xl opacity-80" />
            <div className="absolute -right-20 top-2 h-32 w-32 rounded-full bg-[#EBF4FF] blur-3xl opacity-80" />

            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF3FF] text-blue-600 shadow-sm">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M10 2a3 3 0 00-3 3v2H5.5a1.5 1.5 0 000 3H7v3.5A1.5 1.5 0 008.5 15h3a1.5 1.5 0 001.5-1.5V10h1.5a1.5 1.5 0 000-3H13V5a3 3 0 00-3-3z" fill="currentColor" />
                </svg>
              </div>
              <span className="rounded-full bg-[#E5F0FF] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2563EB] shadow-sm">Employee Self-Service</span>
            </div>

            <div className="mb-10 max-w-[520px]">
              <h1 className="text-[58px] font-extrabold leading-[0.95] tracking-[-0.02em] text-[#0F172A]">
                Welcome <span className="text-[#0F52EE]">Back!</span>
              </h1>
              <div className="mt-2 h-2 w-[120px] rounded-full bg-[#0F52EE] opacity-20" />
              <p className="mt-6 max-w-[520px] text-base leading-8 text-slate-600">
                Your secure digital workplace to manage employee information, leave requests, documents and HR services — all in one place.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.id}
                    className={`flex min-h-[96px] flex-col justify-center gap-3 rounded-[28px] border ${card.border} p-5 ${card.bg} shadow-[0_20px_45px_-36px_rgba(15,23,42,0.25)]`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconBg}`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">{card.title}</h2>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{card.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="relative mt-10 overflow-hidden rounded-[32px] border border-slate-100 bg-[#F8FBFF]">
              <Image src="/assets/office-teamphoto.png" alt="Office team" width={860} height={510} className="h-[420px] w-full object-cover" />
              <div className="absolute inset-x-8 bottom-8 rounded-[32px] bg-slate-950/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 20c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold">Empowering People. Enhancing Work Life.</p>
                </div>
                <div className="mt-3 h-px w-full bg-white/50" />
              </div>
            </div>
          </section>

          <section className="flex w-full flex-col rounded-[44px] bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] lg:w-[48%] lg:p-12">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[26px] bg-[#EFF6FF] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[#1E3A8A]" aria-hidden="true">
                  <path d="M7 7h10v10H7V7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Desidea HRMS</p>
                <p className="mt-1 text-sm text-slate-500">Employee Self-Service Portal</p>
              </div>
            </div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#E5F2FF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#0D4B8B] shadow-sm">
              <Shield className="h-4 w-4" />
              Secure HR Access
            </div>

            <div className="mb-8">
              <h2 className="text-[42px] font-extrabold leading-[1.05] tracking-[-0.02em] text-slate-900">Welcome Back</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Sign in to access your personalized HR workspace securely.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-900">
                  <label htmlFor="email">Work Email</label>
                  <span className="text-xs font-medium text-slate-500">Use your company email</span>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    onBlur={() => handleBlurValidate('email')}
                    placeholder="name@desidea.com"
                    className={`w-full rounded-[28px] border px-4 py-4 pl-14 text-sm text-slate-900 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.35)] outline-none transition-all duration-200 ${
                      fieldErrors.email ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-blue-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-900">
                  <label htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={(event) => setField('password', event.target.value)}
                    onBlur={() => handleBlurValidate('password')}
                    placeholder="Enter your password"
                    className={`w-full rounded-[28px] border px-4 py-4 pl-14 pr-14 text-sm text-slate-900 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.35)] outline-none transition-all duration-200 ${
                      fieldErrors.password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-blue-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={values.remember}
                    onChange={(event) => setField('remember', event.target.checked)}
                    className="h-5 w-5 rounded-lg border border-slate-300 bg-white text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  Remember me
                </label>
              </div>

              {error && <p className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-[28px] bg-gradient-to-r from-[#1252E8] to-[#1E75F5] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-24px_rgba(18,82,232,0.7)] transition duration-200 hover:shadow-[0_22px_48px_-18px_rgba(18,82,232,0.76)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/50 border-t-white animate-spin" />
                ) : (
                  <>
                    <span className="inline-flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Sign In
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              Or continue with
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-[28px] border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 shadow-sm transition duration-200 hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.925 2H2v9.925h9.925V2z" fill="#F25022" />
                <path d="M22 2h-9.925v9.925H22V2z" fill="#7FBA00" />
                <path d="M11.925 12.075H2V22h9.925v-9.925z" fill="#00A4EF" />
                <path d="M22 12.075h-9.925V22H22v-9.925z" fill="#FFB900" />
              </svg>
              Sign in with Company SSO
            </button>

            <div className="mt-7 rounded-[28px] bg-[#E8F2FF] px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#1D4ED8]" />
                <p className="text-sm leading-6 text-slate-700">
                  Your data is protected with <span className="font-semibold text-slate-900">enterprise-grade security</span> and compliance standards.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[32px] bg-white px-8 py-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.25)] sm:flex-row">
          <p className="text-xs text-slate-600">© 2026 Desidea Software Technologies Pvt. Ltd. | All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
            <span className="font-semibold">ISO 9001:2015</span>
            <span className="font-semibold">ISO 27001:2022</span>
            <span className="font-semibold">CMMI Level 3 (Target)</span>
          </div>
        </div>
      </div>
    </main>
  );
}
