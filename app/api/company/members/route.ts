import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthError, isHrOrAdmin, requireMembership, requirePrisma } from '@/lib/auth/session';

export async function GET() {
  try {
    const membership = await requireMembership();
    if (!isHrOrAdmin(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = requirePrisma();
    const members = await db.membership.findMany({
      where: { companyId: membership.companyId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        employeeId: m.employeeId,
        status: m.status,
      })),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to load members.' }, { status: 500 });
  }
}

const patchSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'HR', 'FINANCE', 'ADMIN', 'CEO']),
});

export async function PATCH(request: Request) {
  try {
    const membership = await requireMembership();
    if (!isHrOrAdmin(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid role update.' }, { status: 400 });
    }

    const db = requirePrisma();
    const target = await db.membership.findFirst({
      where: { id: parsed.data.membershipId, companyId: membership.companyId },
    });

    if (!target) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    if (target.role === 'ADMIN' && parsed.data.role !== 'ADMIN') {
      const adminCount = await db.membership.count({
        where: { companyId: membership.companyId, role: 'ADMIN', status: 'active' },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last Admin.' }, { status: 400 });
      }
    }

    const updated = await db.membership.update({
      where: { id: target.id },
      data: { role: parsed.data.role },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      employeeId: updated.employeeId,
      status: updated.status,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update member.' }, { status: 500 });
  }
}
