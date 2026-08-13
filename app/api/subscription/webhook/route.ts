import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { verifyWebhookSignature, getSubscription } from '@/lib/subscription/stripe-utils';
import {
  getCompanySubscription,
  handleStripeSubscriptionUpdate,
  createOrUpdateInvoice,
  updateSubscriptionStatus,
} from '@/lib/subscription/service';
import { requirePrisma } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await request.text();
    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, signature) as Stripe.Event;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
    }

    const db = requirePrisma();

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const companyId = (session.metadata?.companyId as string) || '';

      if (!companyId) {
        console.error('No companyId in checkout session', session.id);
        return NextResponse.json({ ok: true });
      }

      // Update subscription with Stripe customer ID
      const subscription = await getCompanySubscription(companyId);
      if (subscription && session.customer) {
        await updateSubscriptionStatus(subscription.id, 'ACTIVE', {
          stripeCustomerId: session.customer as string,
        });
      }
    }

    // Handle customer.subscription.created
    if (event.type === 'customer.subscription.created') {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      const customerId = stripeSubscription.customer as string;

      // Find company by customer ID
      const subscription = await db.companySubscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (subscription) {
        await handleStripeSubscriptionUpdate(
          stripeSubscription.id,
          customerId,
          stripeSubscription.status,
          (stripeSubscription.items.data[0]?.price?.id as string) || undefined,
          stripeSubscription.current_period_start,
          stripeSubscription.current_period_end,
          stripeSubscription.cancel_at_period_end,
        );
      }
    }

    // Handle customer.subscription.updated
    if (event.type === 'customer.subscription.updated') {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      const customerId = stripeSubscription.customer as string;

      await handleStripeSubscriptionUpdate(
        stripeSubscription.id,
        customerId,
        stripeSubscription.status,
        (stripeSubscription.items.data[0]?.price?.id as string) || undefined,
        stripeSubscription.current_period_start,
        stripeSubscription.current_period_end,
        stripeSubscription.cancel_at_period_end,
      );
    }

    // Handle customer.subscription.deleted
    if (event.type === 'customer.subscription.deleted') {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      const customerId = stripeSubscription.customer as string;

      const subscription = await db.companySubscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (subscription) {
        await updateSubscriptionStatus(subscription.id, 'CANCELED', {
          canceledAt: new Date(),
        });
      }
    }

    // Handle invoice.paid
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;

      if (invoice.subscription) {
        const subscription = await db.companySubscription.findFirst({
          where: { stripeSubscriptionId: invoice.subscription as string },
        });

        if (subscription) {
          await createOrUpdateInvoice(
            subscription.id,
            invoice.id,
            invoice.amount_paid || 0,
            invoice.currency,
            'paid',
            invoice.period_start ?? undefined,
            invoice.period_end ?? undefined,
            invoice.due_date ?? undefined,
            invoice.status_transitions?.paid_at ?? undefined,
            invoice.invoice_pdf ?? undefined,
          );
        }
      }
    }

    // Handle invoice.payment_failed
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;

      if (invoice.subscription) {
        const subscription = await db.companySubscription.findFirst({
          where: { stripeSubscriptionId: invoice.subscription as string },
        });

        if (subscription) {
          await createOrUpdateInvoice(
            subscription.id,
            invoice.id,
            invoice.amount_due || 0,
            invoice.currency,
            'failed',
            invoice.period_start ?? undefined,
            invoice.period_end ?? undefined,
            invoice.due_date ?? undefined,
            undefined,
            invoice.invoice_pdf ?? undefined,
          );

          // Mark subscription as past due
          await updateSubscriptionStatus(subscription.id, 'PAST_DUE');
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
