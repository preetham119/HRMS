'use client';

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownToLine,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Landmark,
  Upload,
  Users,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

type Payslip = {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  netPay: number;
  status: string;
  fileName: string;
};

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function Stat({
  label,
  value,
  detail,
  icon: Icon,
  action,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof WalletCards;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {action ?? <Icon className="h-5 w-5 text-emerald-600" />}
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export function SalarySlipsPage() {
  const { user } = useAuth();
  const isHr = user?.role === 'HR' || user?.role === 'ADMIN' || user?.role === 'FINANCE';
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [employeeId, setEmployeeId] = useState('EMP001');
  const [employeeName, setEmployeeName] = useState('Rajesh Kumar');
  const [period, setPeriod] = useState('July 2026');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadPayslips = () =>
    fetch(`/api/payroll/payslips${isHr ? '' : `?employeeId=${user?.employeeId ?? 'EMP001'}`}`)
      .then((response) => response.json())
      .then(setPayslips)
      .catch(() => setPayslips([]));

  useEffect(() => {
    if (user) loadPayslips();
  }, [isHr, user]);

  const latest = payslips[0];
  const totalNetPay = useMemo(() => payslips.reduce((sum, payslip) => sum + payslip.netPay, 0), [payslips]);

  const downloadPayslip = async (payslip: Payslip) => {
    const response = await fetch(`/api/payroll/payslips?download=${payslip.id}`);
    if (!response.ok) {
      setMessage('This payslip file is not available.');
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = payslip.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []).filter((file) => file.type === 'application/pdf'));
    setMessage('');
  };

  const uploadPayslips = async () => {
    if (!files.length) return;
    setUploading(true);
    setMessage('');
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('employeeId', employeeId);
    formData.append('employeeName', employeeName);
    formData.append('period', period);
    try {
      const response = await fetch('/api/payroll/payslips', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setFiles([]);
      setMessage(
        `${result.uploaded.length} payslip${result.uploaded.length === 1 ? '' : 's'} published for ${employeeName}.`,
      );
      await loadPayslips();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/payroll"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Payroll
          </Link>
        </div>

        <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-emerald-600">Salary</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Salary Slips</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isHr
              ? 'Publish verified payslips and keep every employee record ready for audit.'
              : 'View and download your salary slips.'}
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat
            label={isHr ? 'Employees covered' : 'Latest net pay'}
            value={isHr ? '128' : money.format(latest?.netPay ?? 78200)}
            detail={isHr ? '96% payslips published' : latest?.period ?? 'June 2026'}
            icon={isHr ? Users : WalletCards}
          />
          <Stat
            label={isHr ? 'Payroll total' : 'Year to date'}
            value={isHr ? money.format(10009600) : money.format(totalNetPay || 469200)}
            detail={isHr ? 'July 2026 processing' : 'Net earnings'}
            icon={Landmark}
          />
          <Stat label="Next pay date" value="31 Jul" detail="July 2026 payroll" icon={CheckCircle2} />
          <Stat
            label={isHr ? 'Needs attention' : 'Available slips'}
            value={isHr ? '5' : String(payslips.length || 2)}
            detail={isHr ? 'Records need review' : 'Ready to download'}
            icon={FileText}
            action={
              !isHr ? (
                <button
                  type="button"
                  onClick={() => latest && downloadPayslip(latest)}
                  disabled={!latest}
                  aria-label="Download latest payslip"
                  title="Download latest payslip"
                  className="text-emerald-600 transition hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDownToLine className="h-5 w-5" />
                </button>
              ) : undefined
            }
          />
        </div>

        {!isHr && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Your payslips</h2>
            <p className="mt-1 text-sm text-slate-500">Download official salary slips for each period.</p>
            <div className="mt-5 space-y-3">
              {(payslips.length ? payslips : []).map((payslip) => (
                <div
                  key={payslip.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{payslip.period}</p>
                    <p className="text-xs text-slate-500">
                      {money.format(payslip.netPay)} · {payslip.fileName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void downloadPayslip(payslip)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              ))}
              {!payslips.length && (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No payslips published yet.
                </p>
              )}
            </div>
          </section>
        )}

        {isHr && (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Bulk payslip upload</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Publish one or more PDF payslips to an employee account.
                  </p>
                </div>
                <Upload className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Employee ID
                  <input
                    value={employeeId}
                    onChange={(event) => setEmployeeId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500"
                    placeholder="EMP001"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Employee name
                  <input
                    value={employeeName}
                    onChange={(event) => setEmployeeName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500"
                    placeholder="Rajesh Kumar"
                  />
                </label>
              </div>
              <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
                Payroll period
                <input
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500"
                  placeholder="July 2026"
                />
              </label>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center">
                <Upload className="h-7 w-7 text-emerald-600" />
                <span className="mt-2 text-sm font-semibold text-slate-800">Choose PDF payslips</span>
                <span className="mt-1 text-xs text-slate-500">Multiple files supported, up to 10 MB each</span>
                <input type="file" accept="application/pdf" multiple onChange={handleFiles} className="hidden" />
              </label>
              {files.length > 0 && (
                <p className="mt-3 text-sm text-slate-600">
                  {files.length} PDF{files.length === 1 ? '' : 's'} ready
                </p>
              )}
              {message && (
                <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
              )}
              <button
                type="button"
                onClick={uploadPayslips}
                disabled={!files.length || uploading}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Publishing...' : 'Publish payslips'}
              </button>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Recently published</h2>
              <p className="mt-1 text-sm text-slate-500">Every upload is reflected in the employee payroll view.</p>
              <div className="mt-5 space-y-3">
                {payslips.slice(0, 5).map((payslip) => (
                  <div key={payslip.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {payslip.employeeName}{' '}
                        <span className="font-normal text-slate-500">({payslip.employeeId})</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {payslip.period} · {payslip.fileName}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">Published</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
