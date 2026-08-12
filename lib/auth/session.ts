import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { normalizeAppRole, type AppRole } from '@/lib/auth';

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
};

export function requirePrisma() {
  if (!prisma) {
    throw new Error('Database is not configured. Set DATABASE_URL.');
  }
  return prisma;
}

export async function getCurrentMembership(): Promise<MembershipContext | null> {
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
