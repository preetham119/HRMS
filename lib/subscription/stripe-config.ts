function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function resolveAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL || ''}/subscription?status=success`
  );
}

function resolveCancelUrl(): string {
  return (
    process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL || ''}/subscription?status=canceled`
  );
}

export const stripeConfig = {
  get secretKey() {
    return requireEnv('STRIPE_SECRET_KEY');
  },
  get publishableKey() {
    return requireEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  },
  get webhookSecret() {
    return requireEnv('STRIPE_WEBHOOK_SECRET');
  },
  get priceId() {
    return requireEnv('NEXT_PUBLIC_STRIPE_PRICE_ID');
  },
  get successUrl() {
    return resolveAppUrl();
  },
  get cancelUrl() {
    return resolveCancelUrl();
  },
};

export function getStripePublicKey(): string {
  return stripeConfig.publishableKey;
}

export function getStripeSuccessUrl(): string {
  return stripeConfig.successUrl;
}

export function getStripeCancelUrl(): string {
  return stripeConfig.cancelUrl;
}

export function getStripePriceId(): string {
  return stripeConfig.priceId;
}
