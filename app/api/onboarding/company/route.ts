import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/admin';
import { requirePrisma } from '@/lib/auth/session';
import { apiError } from '@/lib/api/errors';
import { reconcileMembershipsForEmail } from '@/lib/onboarding/orphans';
import { createJoinToken, joinUrlForToken, uniqueCompanySlug } from '@/lib/company';

const schema = z.object({
  companyName: z.string().min(2).max(100),
  adminName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid enrollment details.' }, { status: 400 });
    }

    const { companyName, adminName, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const db = requirePrisma();
    const admin = createServiceClient();

    const emailInUse = await reconcileMembershipsForEmail(db, normalizedEmail);
    if (emailInUse) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: adminName },
    });

    if (createError || !created.user) {
      const alreadyRegistered = /already been registered|already registered|already exists/i.test(
        createError?.message ?? '',
      );

      return NextResponse.json(
        {
          error: alreadyRegistered
            ? 'An account with this email already exists. Sign in instead, or use a different email.'
            : createError?.message || 'Unable to create auth user.',
        },
        { status: alreadyRegistered ? 409 : 400 },
      );
    }

    const authUserId = created.user.id;

    try {
      const slug = await uniqueCompanySlug(companyName);
      const joinToken = createJoinToken();
      const employeeId = 'EMP001';

      const company = await db.$transaction(async (tx) => {
        const createdCompany = await tx.company.create({
          data: {
            name: companyName.trim(),
            slug,
            joinToken,
            joinEnabled: true,
            employeeSeq: 1,
          },
        });

        await tx.membership.create({
          data: {
            authUserId,
            companyId: createdCompany.id,
            email: normalizedEmail,
            name: adminName.trim(),
            role: 'ADMIN',
            employeeId,
            status: 'active',
          },
        });

        await tx.employeeProfile.create({
          data: {
            companyId: createdCompany.id,
            employeeId,
            fullName: adminName.trim(),
            designation: 'Administrator',
            department: '',
            manager: '',
            location: '',
            employmentType: 'Full Time',
            joiningDate: new Date(),
            status: 'Active',
            officialEmail: normalizedEmail,
            personalEmail: normalizedEmail,
          },
        });

        return createdCompany;
      });

      return NextResponse.json({
        ok: true,
        companyId: company.id,
        companyName: company.name,
        joinUrl: joinUrlForToken(joinToken),
        email: normalizedEmail,
      });
    } catch (dbError) {
      await admin.auth.admin.deleteUser(authUserId);
      return apiError(
        'Company onboarding DB error',
        dbError,
        'Failed to create company. Please try again.',
      );
    }
  } catch (error) {
    return apiError('Company onboarding error', error, 'Unexpected server error.');
  }
}
