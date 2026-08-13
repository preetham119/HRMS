import { NextResponse } from 'next/server';
import { AuthError, requireMembership } from '@/lib/auth/session';
import { getCompanySubscription, getSubscriptionInvoices } from '@/lib/subscription/service';

export async function GET() {
  try {
    const membership = await requireMembership();

    // Only ADMIN can view invoices
    if (membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only organization admins can view invoices' },
        { status: 403 },
      );
    }

    const subscription = await getCompanySubscription(membership.companyId);

    if (!subscription) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = await getSubscriptionInvoices(subscription.id);
    return NextResponse.json({ invoices });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Invoices fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
