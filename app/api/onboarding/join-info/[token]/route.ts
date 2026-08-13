import { NextResponse } from 'next/server';
import { getMockCompanyByJoinToken } from '@/lib/auth/mock-company-store';
import { isMockAuthEnabled } from '@/lib/auth/mock-mode';
import { requirePrisma } from '@/lib/auth/session';

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  if (isMockAuthEnabled()) {
    const company = getMockCompanyByJoinToken(token);
    if (!company) {
      return NextResponse.json({ error: 'Join link not found.' }, { status: 404 });
    }
    if (!company.joinEnabled) {
      return NextResponse.json({ error: 'Joining is disabled for this company.' }, { status: 403 });
    }
    return NextResponse.json({ companyName: company.name });
  }

  const db = requirePrisma();
  const company = await db.company.findUnique({
    where: { joinToken: token },
    select: { name: true, joinEnabled: true },
  });

  if (!company) {
    return NextResponse.json({ error: 'Join link not found.' }, { status: 404 });
  }

  if (!company.joinEnabled) {
    return NextResponse.json({ error: 'Joining is disabled for this company.' }, { status: 403 });
  }

  return NextResponse.json({ companyName: company.name });
}
