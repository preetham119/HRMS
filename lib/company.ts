import { randomBytes } from 'crypto';
import { requirePrisma } from '@/lib/auth/session';

export function slugifyCompanyName(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return base || 'company';
}

export async function uniqueCompanySlug(name: string) {
  const db = requirePrisma();
  const base = slugifyCompanyName(name);
  let slug = base;
  let attempt = 0;

  while (await db.company.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return slug;
}

export function createJoinToken() {
  return randomBytes(24).toString('hex');
}

export async function allocateEmployeeId(companyId: string) {
  const db = requirePrisma();
  const company = await db.company.update({
    where: { id: companyId },
    data: { employeeSeq: { increment: 1 } },
  });

  return `EMP${String(company.employeeSeq).padStart(3, '0')}`;
}

export function joinUrlForToken(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  return `${base}/join/${token}`;
}
