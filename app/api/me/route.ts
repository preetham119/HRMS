import { NextResponse } from 'next/server';
import { findMockUserById } from '@/lib/auth/mock-users';
import { getCurrentMembership } from '@/lib/auth/session';

export async function GET() {
  const membership = await getCurrentMembership();
  if (!membership) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mockUser = findMockUserById(membership.membershipId);

  return NextResponse.json({
    id: membership.membershipId,
    email: membership.email,
    name: membership.name,
    role: membership.role,
    employeeId: membership.employeeId,
    companyId: membership.companyId,
    companyName: membership.companyName,
    department: membership.department ?? mockUser?.department,
    profilePicture: membership.profilePicture ?? null,
  });
}
