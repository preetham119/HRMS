import { NextResponse } from 'next/server';
import { createJoinToken, joinUrlForToken } from '@/lib/company';
import { AuthError, isHrOrAdmin, requireMembership, requirePrisma } from '@/lib/auth/session';

export async function GET() {
  try {
    const membership = await requireMembership();
    if (!isHrOrAdmin(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = requirePrisma();
    const company = await db.company.findUniqueOrThrow({ where: { id: membership.companyId } });

    return NextResponse.json({
      joinEnabled: company.joinEnabled,
      joinToken: company.joinToken,
      joinUrl: joinUrlForToken(company.joinToken),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to load join link.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const membership = await requireMembership();
    if (!isHrOrAdmin(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as { action?: string; joinEnabled?: boolean };
    const db = requirePrisma();

    if (body.action === 'regenerate') {
      const company = await db.company.update({
        where: { id: membership.companyId },
        data: { joinToken: createJoinToken() },
      });
      return NextResponse.json({
        joinEnabled: company.joinEnabled,
        joinToken: company.joinToken,
        joinUrl: joinUrlForToken(company.joinToken),
      });
    }

    if (typeof body.joinEnabled === 'boolean') {
      const company = await db.company.update({
        where: { id: membership.companyId },
        data: { joinEnabled: body.joinEnabled },
      });
      return NextResponse.json({
        joinEnabled: company.joinEnabled,
        joinToken: company.joinToken,
        joinUrl: joinUrlForToken(company.joinToken),
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update join link.' }, { status: 500 });
  }
}
