'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock3, Info, PartyPopper, Plus, ShieldCheck, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getLeaveSettings } from '@/lib/settings';

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', color: 'bg-brand-50 text-brand-700' },
  { value: 'casual', label: 'Casual Leave', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-amber-50 text-amber-700' },
  { value: 'compOff', label: 'Comp Off', color: 'bg-violet-50 text-violet-700' },
];

const fallbackBalances = {
  annual: 18,
  casual: 12,
  sick: 8,
  compOff: 3,
  lop: 0,
};

type LeaveHistoryItem = {
  id: string | number;
  type: string;
  dates: string;
  days: number;
  status: string;
  comment: string;
};

const companyHolidays2026 = [
  { date: '01.01.2026', day: 'Thursday', holiday: "New Year's Day" },
  { date: '14.01.2026', day: 'Wednesday', holiday: 'Bhogi' },
  { date: '15.01.2026', day: 'Thursday', holiday: 'Sankranthi' },
  { date: '26.01.2026', day: 'Monday', holiday: 'Republic Day' },
  { date: '19.03.2026', day: 'Thursday', holiday: 'Ugadi' },
  { date: '14.09.2026', day: 'Monday', holiday: 'Vinayaka Chavithi' },
  { date: '02.10.2026', day: 'Friday', holiday: 'Gandhi Jayanthi' },
  { date: '21.10.2026', day: 'Wednesday', holiday: 'Dussehra' },
  { date: '25.12.2026', day: 'Friday', holiday: 'Christmas' },
];

const weekendFestivals2026 = [
  { date: '15.08.2026', day: 'Saturday', festival: 'Independence Day' },
  { date: '08.11.2026', day: 'Sunday', festival: 'Deepavali' },
];

function getDayCount(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

function getLeaveLabel(type: string) {
  return leaveTypes.find((item) => item.value === type)?.label ?? 'Leave';
}

function formatDateLabel(date: string) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function LeaveContent() {
  const searchParams = useSearchParams();
  const [balances, setBalances] = useState(fallbackBalances);
  const [history, setHistory] = useState<LeaveHistoryItem[]>([]);
  const [teamPending, setTeamPending] = useState<LeaveHistoryItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(() => searchParams.get('apply') === '1');
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    contact: '',
    reportingEmail: '',
  });

  const loadLeave = async () => {
    const [mineRes, teamRes] = await Promise.all([
      fetch('/api/leave', { credentials: 'include' }),
      fetch('/api/leave?scope=team', { credentials: 'include' }),
    ]);
    if (mineRes.ok) {
      const data = await mineRes.json();
      if (data.balance) setBalances((prev) => ({ ...prev, ...data.balance }));
      const rows = Array.isArray(data.history) ? data.history : [];
      setHistory(
        rows.map((row: any) => ({
          id: row.id,
          type: row.type,
          dates: row.dates,
          days: getDayCount(row.startDate, row.endDate) || 1,
          status: row.status,
          comment: row.comment || '',
        })),
      );
    }
    if (teamRes.ok) {
      const data = await teamRes.json();
      const rows = Array.isArray(data.history) ? data.history : [];
      setTeamPending(
        rows
          .filter((row: any) => row.status === 'Pending')
          .map((row: any) => ({
            id: row.id,
            type: `${row.employeeName || row.employeeId} · ${row.type}`,
            dates: row.dates,
            days: getDayCount(row.startDate, row.endDate) || 1,
            status: row.status,
            comment: row.comment || '',
          })),
      );
    }
  };

  useEffect(() => {
    void loadLeave();
    const leave = getLeaveSettings();
    setBalances((prev) => ({
      ...prev,
      annual: leave.annualLeaveDays,
      casual: leave.casualLeaveDays,
      sick: leave.sickLeaveDays,
    }));
  }, []);

  const requestedDays = useMemo(
    () => (formState.startDate && formState.endDate ? getDayCount(formState.startDate, formState.endDate) : 0),
    [formState.startDate, formState.endDate],
  );

  const totalTaken = useMemo(
    () => history.filter((entry) => entry.status === 'Approved').reduce((sum, entry) => sum + entry.days, 0),
    [history],
  );

  const pendingCount = useMemo(
    () => history.filter((entry) => entry.status === 'Pending').length,
    [history],
  );

  const handleInput = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.startDate || !formState.endDate || !formState.reason.trim()) {
      setError('Please complete all required fields before submitting.');
      return;
    }

    if (requestedDays <= 0) {
      setError('End date must be the same or after the start date.');
      return;
    }

    if (balances[formState.type as keyof typeof balances] < requestedDays) {
      setError(`You do not have enough ${getLeaveLabel(formState.type).toLowerCase()} balance for this request.`);
      return;
    }

    try {
      const response = await fetch('/api/leave', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType: getLeaveLabel(formState.type),
          startDate: formState.startDate,
          endDate: formState.endDate,
          reason: formState.reason,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit leave');
      }

      setBalances((prev) => ({
        ...prev,
        [formState.type]: prev[formState.type as keyof typeof prev] - requestedDays,
      }));
      await loadLeave();
      setIsFormOpen(false);
      setFormState((prev) => ({
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
        contact: '',
        reportingEmail: prev.reportingEmail,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit leave');
    }
  };

  const reviewLeave = async (id: string | number, status: 'Approved' | 'Rejected') => {
    const response = await fetch('/api/leave', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: String(id), status }),
    });
    if (response.ok) {
      await loadLeave();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Leave management</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Plan time away with clarity</h1>
              <p className="mt-2 text-sm text-slate-500">Apply for leave, review balance, and monitor approvals from one experience.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              {isFormOpen ? 'Close form' : 'Apply leave'}
            </button>
          </div>

          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Leave type</span>
                  <select
                    value={formState.type}
                    onChange={(event) => handleInput('type', event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  >
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Start date</span>
                  <input
                    type="date"
                    value={formState.startDate}
                    onChange={(event) => handleInput('startDate', event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">End date</span>
                  <input
                    type="date"
                    value={formState.endDate}
                    onChange={(event) => handleInput('endDate', event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Duration</span>
                  <input
                    type="text"
                    value={requestedDays ? `${requestedDays} day${requestedDays > 1 ? 's' : ''}` : 'Select dates'}
                    readOnly
                    className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Reason for leave</span>
                <textarea
                  rows={4}
                  value={formState.reason}
                  onChange={(event) => handleInput('reason', event.target.value)}
                  placeholder="Write a concise reason for your request"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Contact while away</span>
                <input
                  type="text"
                  value={formState.contact}
                  onChange={(event) => handleInput('contact', event.target.value)}
                  placeholder="Email or phone for urgent follow-ups"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Reporting To Email</span>
                <input
                  type="email"
                  value={formState.reportingEmail}
                  readOnly
                  placeholder="Manager's email auto-filled"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
                />
              </label>

              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setError('');
                  }}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
                  Submit leave request
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Ready to apply?</h2>
                  <p className="mt-2 text-sm text-slate-500">Click the button to complete your leave request with standard HR fields.</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Current leave balance</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{Object.values(balances).reduce((sum, value) => sum + value, 0)} days</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Pending approvals</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{pendingCount}</p>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { title: 'Annual Leave', value: balances.annual, color: 'bg-brand-50 text-brand-700' },
            { title: 'Casual Leave', value: balances.casual, color: 'bg-emerald-50 text-emerald-700' },
            { title: 'Sick Leave', value: balances.sick, color: 'bg-amber-50 text-amber-700' },
            { title: 'Comp Off', value: balances.compOff, color: 'bg-violet-50 text-violet-700' },
            { title: 'Total taken', value: `${totalTaken} days`, color: 'bg-slate-100 text-slate-800' },
          ].map((item) => (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`inline-flex rounded-2xl px-3 py-2 text-sm font-medium ${item.color}`}>{item.title}</div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Holiday calendar</h2>
                <p className="mt-1 text-sm text-slate-500">Company holiday list for calendar year 2026.</p>
              </div>
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-emerald-50/80 text-slate-700">
                  <tr>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                      Day
                    </th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                      Holiday
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companyHolidays2026.map((item, index) => (
                    <tr
                      key={`${item.date}-${item.holiday}`}
                      className={`border-t border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{item.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.day}</td>
                      <td className="px-4 py-3 text-slate-700">{item.holiday}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                  <PartyPopper className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Optional Holiday</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    01 Optional Holiday is available for every employee.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-900">Festivals Falling on Weekends</p>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                        Date
                      </th>
                      <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                        Day
                      </th>
                      <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                        Festival
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekendFestivals2026.map((item, index) => (
                      <tr
                        key={`${item.date}-${item.festival}`}
                        className={`border-t border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{item.date}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.day}</td>
                        <td className="px-4 py-3 text-slate-700">{item.festival}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <p className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-900">Note:</span> Employees are entitled to one
                optional holiday per calendar year. Optional holidays can only be availed with prior
                approval from the Reporting Manager and HR.
              </p>
            </div>
          </motion.div>

          {teamPending.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Pending team approvals</h2>
              <p className="mt-1 text-sm text-slate-500">Approve or reject leave requests for your company.</p>
              <div className="mt-6 space-y-4">
                {teamPending.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.type}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.dates}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => reviewLeave(item.id, 'Approved')}
                          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewLeave(item.id, 'Rejected')}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Leave history</h2>
                <p className="mt-1 text-sm text-slate-500">Track the status of each request and manager feedback.</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {history.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.type}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.dates}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-sm font-medium ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.status}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="text-sm text-slate-500">
                      <span className="font-medium text-slate-900">Days:</span> {item.days}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      {item.comment}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

export default function LeavePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8" />}>
      <LeaveContent />
    </Suspense>
  );
}
