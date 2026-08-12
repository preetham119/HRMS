/**
 * Deletes application tenant data and the matching Supabase Auth users so the
 * onboarding flows can be retested from a clean slate.
 *
 *   npm run db:reset -- --email=you@company.com   # one account
 *   npm run db:reset -- --all                     # every company in the database
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(file: string) {
  let contents: string;
  try {
    contents = readFileSync(resolve(process.cwd(), file), 'utf8');
  } catch {
    return;
  }

  for (const line of contents.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;

    const key = match[1];
    if (process.env[key] !== undefined) continue;

    let value = (match[2] ?? '').trim();
    if (/^(['"]).*\1$/.test(value)) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const args = process.argv.slice(2);
const emailArg = args.find((arg) => arg.startsWith('--email='))?.split('=')[1]?.toLowerCase();
const resetAll = args.includes('--all');

if (!emailArg && !resetAll) {
  console.error('Refusing to run. Pass --email=<address> or --all.');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const prisma = new PrismaClient();
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function deleteAuthUsersByEmail(emails: string[]) {
  if (emails.length === 0) return 0;

  const wanted = new Set(emails);
  const ids: string[] = [];

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    if (data.users.length === 0) break;

    for (const user of data.users) {
      if (user.email && wanted.has(user.email.toLowerCase())) {
        ids.push(user.id);
      }
    }

    if (data.users.length < 200) break;
  }

  for (const id of ids) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.warn(`  could not delete auth user ${id}: ${error.message}`);
  }

  return ids.length;
}

async function main() {
  const companies = emailArg
    ? await prisma.company.findMany({
        where: { memberships: { some: { email: emailArg } } },
        include: { memberships: true },
      })
    : await prisma.company.findMany({ include: { memberships: true } });

  if (companies.length === 0) {
    console.log('No matching companies found.');
    // The Auth user can still exist without app rows, so try to clear it anyway.
    if (emailArg) {
      const removed = await deleteAuthUsersByEmail([emailArg]);
      console.log(`Deleted ${removed} Supabase Auth user(s) for ${emailArg}.`);
    }
    return;
  }

  const emails = [...new Set(companies.flatMap((c) => c.memberships.map((m) => m.email)))];

  console.log(`Deleting ${companies.length} company(ies) and ${emails.length} member account(s):`);
  for (const company of companies) {
    console.log(`  - ${company.name} (${company.memberships.length} member(s))`);
  }

  const companyIds = companies.map((c) => c.id);

  // Payslip has no company foreign key, so it is not covered by cascade deletes.
  await prisma.payslip.deleteMany({ where: { companyId: { in: companyIds } } });
  await prisma.company.deleteMany({ where: { id: { in: companyIds } } });

  const removed = await deleteAuthUsersByEmail(emails);
  console.log(`Done. Removed ${companies.length} company(ies) and ${removed} Supabase Auth user(s).`);
}

main()
  .catch((error) => {
    console.error('Reset failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
