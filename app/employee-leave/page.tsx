'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, XCircle } from 'lucide-react';

interface LeaveRequest {
  employee: string;
  department: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'On Leave';
}

const leaveRequests: LeaveRequest[] = [
  { employee: 'Amit Sharma', department: 'Engineering', leaveType: 'Annual', from: '2026-07-24', to: '2026-07-26', days: 3, status: 'Pending' },
  { employee: 'Neha Verma', department: 'HR', leaveType: 'Sick', from: '2026-07-20', to: '2026-07-21', days: 2, status: 'Approved' },
  { employee: 'Rohit Mehta', department: 'Sales', leaveType: 'Casual', from: '2026-07-25', to: '2026-07-25', days: 1, status: 'Rejected' },
  { employee: 'Priya Nair', department: 'Engineering', leaveType: 'Comp Off', from: '2026-07-23', to: '2026-07-24', days: 2, status: 'On Leave' },
];

export default function EmployeeLeavePage() {
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredRequests = useMemo(() => {
    if (selectedStatus === 'All') return leaveRequests;
    return leaveRequests.filter((request) => request.status === selectedStatus);
  }, [selectedStatus]);

  const summaryCards = [
    { label: 'Pending Approval', value: leaveRequests.filter((item) => item.status === 'Pending').length, tone: 'amber' },
    { label: 'Approved', value: leaveRequests.filter((item) => item.status === 'Approved').length, tone: 'emerald' },
    { label: 'Rejected', value: leaveRequests.filter((item) => item.status === 'Rejected').length, tone: 'rose' },
    { label: 'On Leave Today', value: leaveRequests.filter((item) => item.status === 'On Leave').length, tone: 'sky' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">HR Operations</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Employee Leave</h1>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="bg-transparent outline-none">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={`mt-2 text-3xl font-semibold ${card.tone === 'amber' ? 'text-amber-600' : card.tone === 'emerald' ? 'text-emerald-600' : card.tone === 'rose' ? 'text-rose-600' : 'text-sky-600'}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Leave Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">From</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">To</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Days</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRequests.map((request) => (
                  <tr key={`${request.employee}-${request.from}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{request.employee}</td>
                    <td className="px-4 py-3 text-slate-700">{request.department}</td>
                    <td className="px-4 py-3 text-slate-700">{request.leaveType}</td>
                    <td className="px-4 py-3 text-slate-700">{request.from}</td>
                    <td className="px-4 py-3 text-slate-700">{request.to}</td>
                    <td className="px-4 py-3 text-slate-700">{request.days}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : request.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : request.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>{request.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="rounded-xl border border-emerald-200 p-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></button>
                        <button className="rounded-xl border border-rose-200 p-2 text-rose-600"><XCircle className="h-4 w-4" /></button>
                        <button className="rounded-xl border border-slate-200 p-2 text-slate-600"><Eye className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
