export type SubscriptionStatus = 
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'EXPIRED'
  | 'INCOMPLETE';

export interface CompanySubscriptionInfo {
  id: string;
  companyId: string;
  planId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  status: SubscriptionStatus;
  trialStartDate: Date;
  trialEndDate: Date;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  description: string | null;
  stripePriceId: string;
  stripeProductId: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  isActive: boolean;
  features: string[];
}

export interface SubscriptionInvoiceInfo {
  id: string;
  subscriptionId: string;
  stripeInvoiceId: string | null;
  amount: number;
  currency: string;
  status: string;
  periodStartDate: Date | null;
  periodEndDate: Date | null;
  dueDate: Date | null;
  paidDate: Date | null;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionStatusResponse {
  subscription: CompanySubscriptionInfo | null;
  plan: SubscriptionPlanInfo | null;
  daysRemaining: number | null;
  isTrialActive: boolean;
  isExpired: boolean;
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  email: string;
  companyId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}
