'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, Check, ChevronRight, Clock, CreditCard, DollarSign, File, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SubscriptionStatusResponse } from '@/lib/subscription/types';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  periodStartDate?: string;
  periodEndDate?: string;
  dueDate?: string;
  paidDate?: string;
  pdfUrl?: string;
  createdAt?: string;
}

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  TRIALING: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  PAST_DUE: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  CANCELED: { bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' },
  EXPIRED: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Show success message if redirected from Stripe
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setSuccessMessage('Subscription activated successfully! Your HRMS access is now active.');
      setTimeout(() => setSuccessMessage(null), 5000);
      router.replace('/subscription');
    }
  }, [searchParams, router]);

  // Fetch subscription status and invoices
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statusRes, invoicesRes] = await Promise.all([
          fetch('/api/subscription/status'),
          fetch('/api/subscription/invoices'),
        ]);

        if (!statusRes.ok) {
          throw new Error('Failed to fetch subscription');
        }

        const statusData = await statusRes.json();
        setSubscription(statusData);

        if (invoicesRes.ok) {
          const invoiceData = await invoicesRes.json();
          setInvoices(invoiceData.invoices || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleSubscribeNow = async () => {
    try {
      setCheckoutLoading(true);
      setError(null);

      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ atPeriodEnd: true }),
      });

      if (!res.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setShowCancelConfirm(false);
      setSuccessMessage('Subscription canceled. Your access will continue until the end of the billing period.');
      
      // Refresh subscription
      const statusRes = await fetch('/api/subscription/status');
      const statusData = await statusRes.json();
      setSubscription(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        </div>
      </main>
    );
  }

  const colors = subscription?.subscription?.status
    ? statusColors[subscription.subscription.status as keyof typeof statusColors]
    : statusColors.ACTIVE;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Billing & Subscription</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">Manage Subscription</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">View and manage your HRMS subscription, billing, and invoices</p>
          </div>
        </motion.section>

        {/* Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-4 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          >
            <Check className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-4 rounded-[24px] border border-red-200 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Subscription Status Card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 rounded-[28px] border-2 p-6 sm:p-8 ${colors.bg}`}
        >
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${colors.badge}`}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {subscription?.subscription?.status || 'TRIALING'}
                </span>
              </div>

              <h2 className={`text-3xl font-bold ${colors.text}`}>
                {subscription?.isTrialActive
                  ? `Free Trial - ${subscription.daysRemaining} Days Remaining`
                  : subscription?.isExpired
                    ? 'Free Trial Expired'
                    : subscription?.plan?.name || 'Premium Plan'}
              </h2>

              <p className={`mt-2 text-base ${colors.text} opacity-80`}>
                {subscription?.isTrialActive
                  ? 'Your free 30-day trial is active'
                  : subscription?.isExpired
                    ? 'Subscribe now to continue using HRMS'
                    : 'Active subscription'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {subscription?.isTrialActive || subscription?.isExpired ? (
                <button
                  onClick={handleSubscribeNow}
                  disabled={checkoutLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Subscribe Now
                </button>
              ) : subscription?.subscription?.status === 'CANCELED' ? (
                <button
                  onClick={handleSubscribeNow}
                  disabled={checkoutLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Renew Subscription
                </button>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Trial or Billing Details */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Trial/Billing Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Billing Information</h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Plan</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {subscription?.plan?.name || 'Free Trial'}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Price</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {subscription?.plan
                    ? `₹${(subscription.plan.amount / 100).toFixed(2)} / ${subscription.plan.billingPeriod}`
                    : 'Free'}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {subscription?.subscription?.status || 'TRIALING'}
                </span>
              </div>

              {subscription?.isTrialActive && subscription?.subscription?.trialEndDate && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Trial Ends</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(subscription.subscription.trialEndDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {subscription?.subscription?.currentPeriodEnd && subscription?.subscription?.status === 'ACTIVE' && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Renews On</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Included Features</h3>
            <div className="space-y-3">
              {(subscription?.plan?.features || [
                'Employee Management',
                'Leave & Attendance Tracking',
                'Payroll Management',
                'Performance Reviews',
                'Document Management',
              ]).map((feature: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Invoices */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Billing History</h3>

          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <File className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600 dark:text-slate-400">No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    <th className="py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Period</th>
                    <th className="py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                    <th className="py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                      <td className="py-4 text-sm text-slate-900 dark:text-white">
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                        {invoice.periodStartDate && invoice.periodEndDate
                          ? `${new Date(invoice.periodStartDate).toLocaleDateString()} - ${new Date(invoice.periodEndDate).toLocaleDateString()}`
                          : '-'}
                      </td>
                      <td className="py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        {invoice.currency} {(invoice.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-4 text-sm">
                        <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${
                          invoice.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : invoice.status === 'failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-[24px] bg-white p-6 dark:bg-slate-900"
            >
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Cancel Subscription?</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Your subscription will be canceled at the end of the current billing period. You'll continue to have access to all features until then.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
