import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { AUTH_COOKIE_NAME, decodeJwtToken, normalizeAppRole, type AppRole } from '@/lib/auth';
import { isMockAuthEnabled } from '@/lib/auth/mock-mode';
import { getMockProfile } from '@/lib/auth/mock-profile-store';
import { findMockUserByEmail, findMockUserById, MOCK_COMPANY } from '@/lib/auth/mock-users';

export type MembershipContext = {
  authUserId: string;
  membershipId: string;
  companyId: string;
  companyName: string;
  email: string;
  name: string;
  role: AppRole;
  employeeId: string;
  status: string;
  department?: string;
  profilePicture?: string | null;
};

export function requirePrisma() {
  if (!prisma) {
    throw new Error('Database is not configured. Set DATABASE_URL.');
  }
  return prisma;
}

async function getMockMembership(): Promise<MembershipContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const payload = decodeJwtToken(token);

  if (!payload || payload.exp * 1000 < Date.now()) {
    return null;
  }

  const mockUser = findMockUserById(payload.id) ?? findMockUserByEmail(payload.email);
  if (!mockUser) {
    return null;
  }

  const profile = getMockProfile(mockUser.employeeId);

  return {
    authUserId: mockUser.id,
    membershipId: mockUser.id,
    companyId: MOCK_COMPANY.id,
    companyName: MOCK_COMPANY.name,
    email: mockUser.email,
    name: profile?.fullName || mockUser.name,
    role: mockUser.role,
    employeeId: mockUser.employeeId,
    status: 'active',
    department: profile?.department || mockUser.department,
    profilePicture: profile?.profilePicture ?? null,
  };
}

export async function getCurrentMembership(): Promise<MembershipContext | null> {
  if (isMockAuthEnabled()) {
    return getMockMembership();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const db = requirePrisma();
  const membership = await db.membership.findUnique({
    where: { authUserId: user.id },
    include: { company: true },
  });

  if (!membership || membership.status !== 'active') {
    return null;
  }

  return {
    authUserId: user.id,
    membershipId: membership.id,
    companyId: membership.companyId,
    companyName: membership.company.name,
    email: membership.email,
    name: membership.name,
    role: normalizeAppRole(membership.role),
    employeeId: membership.employeeId,
    status: membership.status,
    department: undefined,
    profilePicture: null,
  };
}

export async function requireMembership(): Promise<MembershipContext> {
  const membership = await getCurrentMembership();
  if (!membership) {
    throw new AuthError('Unauthorized', 401);
  }
  return membership;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function isHrOrAdmin(role: AppRole) {
  return role === 'HR' || role === 'ADMIN' || role === 'CEO';
}

export function canApproveLeave(role: AppRole) {
  return role === 'MANAGER' || role === 'HR' || role === 'ADMIN' || role === 'CEO';
}
