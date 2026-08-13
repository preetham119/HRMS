import { NextResponse } from 'next/server';
import { AuthError, requireMembership, requirePrisma } from '@/lib/auth/session';
import { getSubscriptionStatus } from '@/lib/subscription/service';

export async function GET() {
  try {
    const membership = await requireMembership();
    
    const status = await getSubscriptionStatus(membership.companyId);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Subscription status error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription status' }, { status: 500 });
  }
}
