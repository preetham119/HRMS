import { NextResponse } from 'next/server';
import { getSubscriptionPlans } from '@/lib/subscription/service';

export async function GET() {
  try {
    const plans = await getSubscriptionPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}
