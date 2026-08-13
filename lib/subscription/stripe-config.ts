const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
const successUrl = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=success`;
const cancelUrl = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=canceled`;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

if (!stripePublishableKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
}

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
}

if (!priceId) {
  throw new Error('NEXT_PUBLIC_STRIPE_PRICE_ID is not configured');
}

export const stripeConfig = {
  secretKey: stripeSecretKey,
  publishableKey: stripePublishableKey,
  webhookSecret,
  priceId,
  successUrl,
  cancelUrl,
};

export function getStripePublicKey(): string {
  return stripePublishableKey;
}

export function getStripeSuccessUrl(): string {
  return successUrl;
}

export function getStripeCancelUrl(): string {
  return cancelUrl;
}

export function getStripePriceId(): string {
  return priceId;
}
