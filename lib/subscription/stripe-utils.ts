import Stripe from 'stripe';
import { stripeConfig } from './stripe-config';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeClient;
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(params: {
  customerId?: string;
  email: string;
  priceId: string;
  companyId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.email,
    subscription_data: {
      metadata: {
        companyId: params.companyId,
      },
    },
    metadata: {
      companyId: params.companyId,
    },
  };

  if (params.customerId) {
    sessionParams.customer = params.customerId;
  }

  return await getStripe().checkout.sessions.create(sessionParams);
}

/**
 * Retrieve a checkout session
 */
export async function retrieveCheckoutSession(sessionId: string) {
  return await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });
}

/**
 * Get a customer by email or ID
 */
export async function getOrCreateCustomer(email: string, customerId?: string) {
  if (customerId) {
    return await getStripe().customers.retrieve(customerId);
  }

  // Search for existing customer
  const customers = await getStripe().customers.list({ email, limit: 1 });
  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return await getStripe().customers.create({ email });
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await getStripe().subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true) {
  if (atPeriodEnd) {
    return await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
  return await getStripe().subscriptions.cancel(subscriptionId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(body: string, signature: string): object {
  try {
    return getStripe().webhooks.constructEvent(body, signature, stripeConfig.webhookSecret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

/**
 * Get invoice
 */
export async function getInvoice(invoiceId: string) {
  return await getStripe().invoices.retrieve(invoiceId);
}

/**
 * List invoices for a subscription
 */
export async function listSubscriptionInvoices(subscriptionId: string) {
  return await getStripe().invoices.list({
    subscription: subscriptionId,
    limit: 100,
  });
}

/**
 * Get product details
 */
export async function getProduct(productId: string) {
  return await getStripe().products.retrieve(productId);
}

/**
 * Get price details
 */
export async function getPrice(priceId: string) {
  return await getStripe().prices.retrieve(priceId);
}
