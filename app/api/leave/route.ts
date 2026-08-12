import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  AuthError,
  canApproveLeave,
  requireMembership,
  requirePrisma,
} from '@/lib/auth/session';

function formatLeave(row: {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  managerComment: string | null;
  employeeId: string;
  employeeName: string;
  reason: string | null;
}) {
  const dates = `${row.startDate.toISOString().slice(0, 10)} - ${row.endDate.toISOString().slice(0, 10)}`;
  return {
    id: row.id,
    type: row.leaveType,
    dates,
    status: row.status,
    comment: row.managerComment || row.reason || '',
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    leaveType: row.leaveType,
    startDate: row.startDate.toISOString().slice(0, 10),
    endDate: row.endDate.toISOString().slice(0, 10),
    reason: row.reason,
    managerComment: row.managerComment,
  };
}

export async function GET(request: Request) {
  try {
    const membership = await requireMembership();
    const db = requirePrisma();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');

    const where =
      scope === 'team' && canApproveLeave(membership.role)
        ? { companyId: membership.companyId }
        : { companyId: membership.companyId, employeeId: membership.employeeId };

    const history = await db.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      balance: {
        annual: 18,
        casual: 7,
        sick: 5,
        compOff: 3,
        lop: 0,
      },
      history: history.map(formatLeave),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Leave GET error:', error);
    return NextResponse.json({ error: 'Failed to load leave' }, { status: 500 });
  }
}

const createSchema = z.object({
  leaveType: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const membership = await requireMembership();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid leave request' }, { status: 400 });
    }

    const db = requirePrisma();
    const created = await db.leaveRequest.create({
      data: {
        companyId: membership.companyId,
        employeeId: membership.employeeId,
        employeeName: membership.name,
        leaveType: parsed.data.leaveType,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        reason: parsed.data.reason,
        status: 'Pending',
      },
    });

    return NextResponse.json(formatLeave(created), { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Leave POST error:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['Approved', 'Rejected']),
  managerComment: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const membership = await requireMembership();
    if (!canApproveLeave(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid review payload' }, { status: 400 });
    }

    const db = requirePrisma();
    const existing = await db.leaveRequest.findFirst({
      where: { id: parsed.data.id, companyId: membership.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const updated = await db.leaveRequest.update({
      where: { id: existing.id },
      data: {
        status: parsed.data.status,
        managerComment: parsed.data.managerComment,
        reviewedBy: membership.email,
      },
    });

    return NextResponse.json(formatLeave(updated));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Leave PATCH error:', error);
    return NextResponse.json({ error: 'Failed to review leave' }, { status: 500 });
  }
}
