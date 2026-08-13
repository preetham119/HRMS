import { NextResponse } from 'next/server';
import { AuthError, requireMembership } from '@/lib/auth/session';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/subscription/stripe-utils';
import { getCompanySubscription } from '@/lib/subscription/service';
import { getStripeSuccessUrl, getStripeCancelUrl } from '@/lib/subscription/stripe-config';

export async function POST(request: Request) {
  try {
    const membership = await requireMembership();

    // Only ADMIN can create checkout sessions
    if (membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only organization admins can manage subscriptions' },
        { status: 403 },
      );
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get existing subscription
    const existingSubscription = await getCompanySubscription(membership.companyId);

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(
      membership.email,
      existingSubscription?.stripeCustomerId || undefined,
    );

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      email: membership.email,
      priceId,
      companyId: membership.companyId,
      successUrl: `${getStripeSuccessUrl()}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: getStripeCancelUrl(),
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
