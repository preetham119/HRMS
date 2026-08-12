'use client';

import { useMemo, useState } from 'react';
import { Download, Filter, Search } from 'lucide-react';

interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent';
}

const attendanceData: AttendanceRecord[] = [
  { employeeId: 'EMP001', employeeName: 'Amit Sharma', department: 'Engineering', date: '2026-07-22', checkIn: '09:00', checkOut: '18:00', status: 'Present' },
  { employeeId: 'EMP002', employeeName: 'Neha Verma', department: 'HR', date: '2026-07-22', checkIn: '09:30', checkOut: '18:30', status: 'Late' },
  { employeeId: 'EMP003', employeeName: 'Rohit Mehta', department: 'Sales', date: '2026-07-22', checkIn: '-', checkOut: '-', status: 'Absent' },
  { employeeId: 'EMP004', employeeName: 'Priya Nair', department: 'Engineering', date: '2026-07-21', checkIn: '08:50', checkOut: '17:50', status: 'Present' },
  { employeeId: 'EMP005', employeeName: 'Karan Singh', department: 'Finance', date: '2026-07-21', checkIn: '10:00', checkOut: '19:00', status: 'Late' },
];

export default function EmployeeAttendancePage() {
  const [department, setDepartment] = useState('All');
  const [employeeName, setEmployeeName] = useState('');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return attendanceData.filter((item) => {
      const matchesDepartment = department === 'All' || item.department === department;
      const matchesName = !employeeName || item.employeeName.toLowerCase().includes(employeeName.toLowerCase());
      const matchesDate = !date || item.date === date;
      const matchesSearch = !search || `${item.employeeId} ${item.employeeName} ${item.department}`.toLowerCase().includes(search.toLowerCase());
      return matchesDepartment && matchesName && matchesDate && matchesSearch;
    });
  }, [department, employeeName, date, search]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const rows = [
      ['Employee ID', 'Employee Name', 'Department', 'Date', 'Check In', 'Check Out', 'Status'],
      ...filtered.map((item) => [item.employeeId, item.employeeName, item.department, item.date, item.checkIn, item.checkOut, item.status]),
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'employee-attendance.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">HR Operations</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Employee Attendance</h1>
            </div>
            <button onClick={exportCsv} className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="mb-2 flex items-center gap-2 font-medium"><Filter className="h-4 w-4" /> Department</span>
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className="w-full bg-transparent outline-none">
                <option value="All">All</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="mb-2 flex items-center gap-2 font-medium"><Search className="h-4 w-4" /> Employee Name</span>
              <input value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search name" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="mb-2 flex items-center gap-2 font-medium"><Filter className="h-4 w-4" /> Date</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full bg-transparent outline-none" />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="mb-2 flex items-center gap-2 font-medium"><Search className="h-4 w-4" /> Search</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent outline-none" placeholder="ID, name, dept" />
            </label>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Employee Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Check In</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Check Out</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pagedData.map((item) => (
                  <tr key={`${item.employeeId}-${item.date}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{item.employeeId}</td>
                    <td className="px-4 py-3 text-slate-700">{item.employeeName}</td>
                    <td className="px-4 py-3 text-slate-700">{item.department}</td>
                    <td className="px-4 py-3 text-slate-700">{item.date}</td>
                    <td className="px-4 py-3 text-slate-700">{item.checkIn}</td>
                    <td className="px-4 py-3 text-slate-700">{item.checkOut}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Showing {pagedData.length} of {filtered.length} records</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">Previous</button>
              <span className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{page} / {totalPages}</span>
              <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">Next</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
