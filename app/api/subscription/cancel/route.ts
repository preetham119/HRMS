import { NextResponse } from 'next/server';
import { AuthError, requireMembership } from '@/lib/auth/session';
import { cancelSubscription } from '@/lib/subscription/stripe-utils';
import { getCompanySubscription, updateSubscriptionStatus } from '@/lib/subscription/service';

export async function POST(request: Request) {
  try {
    const membership = await requireMembership();

    // Only ADMIN can cancel subscriptions
    if (membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only organization admins can manage subscriptions' },
        { status: 403 },
      );
    }

    const { atPeriodEnd = true } = await request.json();

    const subscription = await getCompanySubscription(membership.companyId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 },
      );
    }

    // Cancel at Stripe
    await cancelSubscription(subscription.stripeSubscriptionId, atPeriodEnd);

    // Update DB
    await updateSubscriptionStatus(subscription.id, 'CANCELED', {
      cancelAtPeriodEnd: atPeriodEnd,
      canceledAt: atPeriodEnd ? null : new Date(),
    });

    return NextResponse.json({ success: true, message: 'Subscription canceled successfully' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
