import { PayrollDetailPage } from '@/components/payroll/payroll-detail-page';

const PAGES = [
  'current-salary',
  'previous-salary',
  'form-16',
  'tax-declaration',
  'tax-projection',
  'reimbursements',
  'bonus',
  'incentives',
  'variable-pay',
  'pf',
  'esi',
  'professional-tax',
  'tds',
  'salary-advance',
  'loan-status',
] as const;

export function generateStaticParams() {
  return PAGES.map((slug) => ({ slug }));
}

export default async function PayrollSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PayrollDetailPage slug={slug} />;
}
