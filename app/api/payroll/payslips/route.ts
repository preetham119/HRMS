import { NextRequest, NextResponse } from 'next/server';

type PayslipRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  netPay: number;
  status: 'Published' | 'Processing';
  uploadedAt: string;
  fileName: string;
  fileData: string;
};

const payslips: PayslipRecord[] = [
  { id: 'PS-2026-06-EMP001', employeeId: 'EMP001', employeeName: 'Rajesh Kumar', period: 'June 2026', netPay: 78200, status: 'Published', uploadedAt: '2026-07-01T09:00:00.000Z', fileName: 'EMP001_June_2026.pdf', fileData: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF').toString('base64') },
  { id: 'PS-2026-05-EMP001', employeeId: 'EMP001', employeeName: 'Rajesh Kumar', period: 'May 2026', netPay: 78200, status: 'Published', uploadedAt: '2026-06-01T09:00:00.000Z', fileName: 'EMP001_May_2026.pdf', fileData: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF').toString('base64') },
];

export async function GET(request: NextRequest) {
  const employeeId = request.nextUrl.searchParams.get('employeeId');
  const downloadId = request.nextUrl.searchParams.get('download');
  if (downloadId) {
    const payslip = payslips.find((entry) => entry.id === downloadId);
    if (!payslip?.fileData) return NextResponse.json({ error: 'Payslip file is not available in this demo store.' }, { status: 404 });
    return new NextResponse(Buffer.from(payslip.fileData, 'base64'), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${payslip.fileName}"` } });
  }
  const result = employeeId ? payslips.filter((payslip) => payslip.employeeId === employeeId) : payslips;
  return NextResponse.json(result.map(({ fileData, ...payslip }) => payslip));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll('files');
  const employeeId = String(formData.get('employeeId') ?? '').trim().toUpperCase();
  const employeeName = String(formData.get('employeeName') ?? '').trim();
  const period = String(formData.get('period') ?? '').trim();

  if (!employeeId || !employeeName || !period || files.length === 0) {
    return NextResponse.json({ error: 'Employee, payroll period, and at least one PDF are required.' }, { status: 400 });
  }

  const invalidFile = files.find((file) => !(file instanceof File) || file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024);
  if (invalidFile) return NextResponse.json({ error: 'Only PDF payslips up to 10 MB are supported.' }, { status: 400 });

  const created = await Promise.all(files.map(async (file) => {
    const fileData = file instanceof File ? Buffer.from(await file.arrayBuffer()).toString('base64') : '';
    const record: PayslipRecord = {
      id: `PS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      employeeId,
      employeeName,
      period,
      netPay: 0,
      status: 'Published',
      uploadedAt: new Date().toISOString(),
      fileName: file instanceof File ? file.name : 'payslip.pdf',
      fileData,
    };
    payslips.unshift(record);
    return record;
  }));

  return NextResponse.json({ uploaded: created }, { status: 201 });
}