import { prisma } from '@/lib/prisma';
import type { SubscriptionStatus, CompanySubscriptionInfo, SubscriptionStatusResponse } from './types';

/**
 * Get subscription for a company
 */
export async function getCompanySubscription(companyId: string) {
  return await prisma.companySubscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });
}

/**
 * Get subscription status with calculated fields
 */
export async function getSubscriptionStatus(companyId: string): Promise<SubscriptionStatusResponse> {
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });

  if (!subscription) {
    return {
      subscription: null,
      plan: null,
      daysRemaining: null,
      isTrialActive: false,
      isExpired: false,
    };
  }

  const now = new Date();
  const isTrialActive = subscription.status === 'TRIALING' && now < subscription.trialEndDate;
  const isExpired = subscription.status === 'EXPIRED' || (now >= subscription.trialEndDate && subscription.status === 'TRIALING');

  let daysRemaining = null;
  if (isTrialActive) {
    const diffTime = subscription.trialEndDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    subscription: subscription as CompanySubscriptionInfo,
    plan: subscription.plan,
    daysRemaining,
    isTrialActive,
    isExpired,
  };
}

/**
 * Create initial trial subscription for a new company
 */
export async function createTrialSubscription(companyId: string) {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 30);

  return await prisma.companySubscription.create({
    data: {
      companyId,
      status: 'TRIALING',
      trialStartDate: now,
      trialEndDate: trialEnd,
    },
    include: { plan: true },
  });
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
  updates?: {
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripePriceId?: string;
    planId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date | null;
  },
) {
  return await prisma.companySubscription.update({
    where: { id: subscriptionId },
    data: {
      status,
      ...updates,
    },
    include: { plan: true },
  });
}

/**
 * Handle subscription from Stripe webhook
 */
export async function handleStripeSubscriptionUpdate(
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  status: string,
  stripePriceId?: string,
  currentPeriodStart?: number,
  currentPeriodEnd?: number,
  cancelAtPeriodEnd?: boolean,
) {
  let subscription = await prisma.companySubscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!subscription) {
    subscription = await prisma.companySubscription.findUnique({
      where: { stripeCustomerId },
    });
  }

  if (!subscription) {
    throw new Error(`Subscription not found for stripe ID: ${stripeSubscriptionId}`);
  }

  const mappedStatus = mapStripeStatusToApp(status);

  return await prisma.companySubscription.update({
    where: { id: subscription.id },
    data: {
      stripeSubscriptionId,
      stripeCustomerId,
      status: mappedStatus,
      stripePriceId,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : undefined,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
      cancelAtPeriodEnd,
    },
    include: { plan: true },
  });
}

/**
 * Map Stripe subscription status to app status
 */
export function mapStripeStatusToApp(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'trialing':
      return 'TRIALING';
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'incomplete':
      return 'INCOMPLETE';
    case 'incomplete_expired':
      return 'EXPIRED';
    default:
      return 'INCOMPLETE';
  }
}

/**
 * Check if a subscription status allows feature access
 */
export function canAccessFeatures(status: SubscriptionStatus, gracePeriodDays = 7): boolean {
  if (status === 'ACTIVE' || status === 'TRIALING') {
    return true;
  }
  // Allow PAST_DUE for grace period
  if (status === 'PAST_DUE') {
    return true;
  }
  return false;
}

/**
 * Create invoice record from Stripe invoice
 */
export async function createOrUpdateInvoice(
  subscriptionId: string,
  stripeInvoiceId: string,
  amount: number,
  currency: string,
  status: string,
  periodStart?: number,
  periodEnd?: number,
  dueDate?: number,
  paidDate?: number,
  pdfUrl?: string,
) {
  const existing = await prisma.subscriptionInvoice.findUnique({
    where: { stripeInvoiceId },
  });

  if (existing) {
    return await prisma.subscriptionInvoice.update({
      where: { id: existing.id },
      data: {
        amount,
        currency,
        status,
        periodStartDate: periodStart ? new Date(periodStart * 1000) : undefined,
        periodEndDate: periodEnd ? new Date(periodEnd * 1000) : undefined,
        dueDate: dueDate ? new Date(dueDate * 1000) : undefined,
        paidDate: paidDate ? new Date(paidDate * 1000) : undefined,
        pdfUrl,
      },
    });
  }

  return await prisma.subscriptionInvoice.create({
    data: {
      subscriptionId,
      stripeInvoiceId,
      amount,
      currency,
      status,
      periodStartDate: periodStart ? new Date(periodStart * 1000) : undefined,
      periodEndDate: periodEnd ? new Date(periodEnd * 1000) : undefined,
      dueDate: dueDate ? new Date(dueDate * 1000) : undefined,
      paidDate: paidDate ? new Date(paidDate * 1000) : undefined,
      pdfUrl,
    },
  });
}

/**
 * Get invoices for a subscription
 */
export async function getSubscriptionInvoices(subscriptionId: string) {
  return await prisma.subscriptionInvoice.findMany({
    where: { subscriptionId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all active subscription plans
 */
export async function getSubscriptionPlans() {
  return await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { amount: 'asc' },
  });
}

/**
 * Get a specific plan
 */
export async function getSubscriptionPlan(planId: string) {
  return await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });
}

/**
 * Get plan by Stripe price ID
 */
export async function getPlanByStripePriceId(stripePriceId: string) {
  return await prisma.subscriptionPlan.findUnique({
    where: { stripePriceId },
  });
}
