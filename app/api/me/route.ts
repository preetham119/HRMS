import { NextResponse } from 'next/server';
import { getCurrentMembership } from '@/lib/auth/session';

export async function GET() {
  const membership = await getCurrentMembership();
  if (!membership) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: membership.membershipId,
    email: membership.email,
    name: membership.name,
    role: membership.role,
    employeeId: membership.employeeId,
    companyId: membership.companyId,
    companyName: membership.companyName,
  });
}
