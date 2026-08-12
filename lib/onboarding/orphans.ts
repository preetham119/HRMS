import type { PrismaClient } from '@prisma/client';
import { createServiceClient } from '@/lib/supabase/admin';

async function authUserExists(authUserId: string) {
  const admin = createServiceClient();
  const { data, error } = await admin.auth.admin.getUserById(authUserId);

  if (error) {
    // Treat "not found" as a genuinely missing user; any other failure is
    // inconclusive, so assume the user exists and keep the membership.
    const status = (error as { status?: number }).status;
    if (status === 404) return false;
    return true;
  }

  return Boolean(data?.user);
}

async function deleteMembershipAndProfile(
  db: PrismaClient,
  membership: { id: string; companyId: string; employeeId: string },
) {
  await db.membership.delete({ where: { id: membership.id } });
  await db.employeeProfile.deleteMany({
    where: { companyId: membership.companyId, employeeId: membership.employeeId },
  });

  const remaining = await db.membership.count({ where: { companyId: membership.companyId } });
  if (remaining === 0) {
    // Company relations cascade, so this also clears its profiles, leave and documents.
    await db.company.delete({ where: { id: membership.companyId } });
  }
}

/**
 * Removes membership rows whose Supabase Auth user no longer exists, which happens
 * when a user is deleted from the Supabase dashboard (that delete does not cascade
 * into application tables).
 *
 * Returns true when a membership backed by a live Auth user still holds the email.
 */
export async function reconcileMembershipsForEmail(db: PrismaClient, email: string) {
  const memberships = await db.membership.findMany({ where: { email } });

  for (const membership of memberships) {
    if (await authUserExists(membership.authUserId)) {
      return true;
    }
    await deleteMembershipAndProfile(db, membership);
  }

  return false;
}
