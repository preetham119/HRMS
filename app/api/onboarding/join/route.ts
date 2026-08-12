import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { AuthError, requirePrisma } from '@/lib/auth/session';
import { apiError } from '@/lib/api/errors';
import { reconcileMembershipsForEmail } from '@/lib/onboarding/orphans';
import { allocateEmployeeId } from '@/lib/company';

const schema = z.object({
  token: z.string().min(10),
  name: z.string().min(2).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid join request.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'You must be signed in to join a company.' }, { status: 401 });
    }

    const db = requirePrisma();
    const email = user.email.toLowerCase();

    const existing = await db.membership.findUnique({ where: { authUserId: user.id } });
    if (existing) {
      return NextResponse.json(
        { error: 'You already belong to a company. One company per account in this MVP.' },
        { status: 409 },
      );
    }

    // Clears rows left behind by an Auth user that was deleted from the Supabase
    // dashboard, which would otherwise collide on the per-company email constraint.
    await reconcileMembershipsForEmail(db, email);

    const company = await db.company.findUnique({ where: { joinToken: parsed.data.token } });
    if (!company || !company.joinEnabled) {
      return NextResponse.json({ error: 'This join link is invalid or disabled.' }, { status: 404 });
    }

    const name =
      parsed.data.name?.trim() ||
      (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null) ||
      user.email.split('@')[0];

    const employeeId = await allocateEmployeeId(company.id);

    await db.$transaction(async (tx) => {
      await tx.membership.create({
        data: {
          authUserId: user.id,
          companyId: company.id,
          email,
          name,
          role: 'EMPLOYEE',
          employeeId,
          status: 'active',
        },
      });

      await tx.employeeProfile.create({
        data: {
          companyId: company.id,
          employeeId,
          fullName: name,
          designation: 'Employee',
          department: '',
          manager: '',
          location: '',
          employmentType: 'Full Time',
          joiningDate: new Date(),
          status: 'Active',
          officialEmail: email,
          personalEmail: email,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      companyId: company.id,
      companyName: company.name,
      employeeId,
      role: 'EMPLOYEE',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return apiError('Join company error', error, 'Failed to join company.');
  }
}
