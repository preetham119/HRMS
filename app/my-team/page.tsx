'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Filter,
  Mail,
  MoreVertical,
  Search,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';

type TeamStatus = 'Present' | 'On Leave' | 'Work From Home';

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  status: TeamStatus;
  leaveUsed: number;
  leaveTotal: number;
  initials: string;
  avatarTone: string;
}

const teamMembers: TeamMember[] = [
  { id: 'EMP0012', name: 'Amit Sharma', designation: 'Senior Developer', department: 'Development', status: 'Present', leaveUsed: 18.5, leaveTotal: 20, initials: 'AS', avatarTone: 'bg-sky-100 text-sky-700' },
  { id: 'EMP0015', name: 'Priya Patel', designation: 'UI/UX Designer', department: 'Design', status: 'On Leave', leaveUsed: 12, leaveTotal: 20, initials: 'PP', avatarTone: 'bg-rose-100 text-rose-700' },
  { id: 'EMP0018', name: 'Rahul Verma', designation: 'QA Engineer', department: 'Quality Assurance', status: 'Work From Home', leaveUsed: 15, leaveTotal: 20, initials: 'RV', avatarTone: 'bg-violet-100 text-violet-700' },
  { id: 'EMP0021', name: 'Sneha Reddy', designation: 'Frontend Developer', department: 'Development', status: 'Present', leaveUsed: 19, leaveTotal: 20, initials: 'SR', avatarTone: 'bg-emerald-100 text-emerald-700' },
  { id: 'EMP0024', name: 'Vikram Singh', designation: 'Backend Developer', department: 'Development', status: 'Present', leaveUsed: 16.5, leaveTotal: 20, initials: 'VS', avatarTone: 'bg-amber-100 text-amber-700' },
  { id: 'EMP0027', name: 'Ananya Gupta', designation: 'Product Designer', department: 'Design', status: 'Present', leaveUsed: 14, leaveTotal: 20, initials: 'AG', avatarTone: 'bg-fuchsia-100 text-fuchsia-700' },
  { id: 'EMP0030', name: 'Karan Mehta', designation: 'DevOps Engineer', department: 'Development', status: 'Present', leaveUsed: 17, leaveTotal: 20, initials: 'KM', avatarTone: 'bg-cyan-100 text-cyan-700' },
  { id: 'EMP0033', name: 'Neha Joshi', designation: 'QA Lead', department: 'Quality Assurance', status: 'On Leave', leaveUsed: 10, leaveTotal: 20, initials: 'NJ', avatarTone: 'bg-orange-100 text-orange-700' },
  { id: 'EMP0036', name: 'Arjun Nair', designation: 'Full Stack Developer', department: 'Development', status: 'Present', leaveUsed: 18, leaveTotal: 20, initials: 'AN', avatarTone: 'bg-blue-100 text-blue-700' },
  { id: 'EMP0039', name: 'Meera Iyer', designation: 'Visual Designer', department: 'Design', status: 'Present', leaveUsed: 13.5, leaveTotal: 20, initials: 'MI', avatarTone: 'bg-pink-100 text-pink-700' },
  { id: 'EMP0042', name: 'Rohan Das', designation: 'Mobile Developer', department: 'Development', status: 'Work From Home', leaveUsed: 16, leaveTotal: 20, initials: 'RD', avatarTone: 'bg-indigo-100 text-indigo-700' },
  { id: 'EMP0045', name: 'Divya Kapoor', designation: 'Business Analyst', department: 'Product', status: 'Present', leaveUsed: 15.5, leaveTotal: 20, initials: 'DK', avatarTone: 'bg-teal-100 text-teal-700' },
];

const statusStyles: Record<TeamStatus, string> = {
  Present: 'bg-emerald-50 text-emerald-700',
  'On Leave': 'bg-orange-50 text-orange-700',
  'Work From Home': 'bg-violet-50 text-violet-700',
};

const departments = ['All Departments', 'Development', 'Design', 'Quality Assurance', 'Product'];
const statuses = ['All Status', 'Present', 'On Leave', 'Work From Home'];

export default function MyTeamPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        !search ||
        `${member.name} ${member.id} ${member.designation} ${member.department}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || member.status === statusFilter;
      const matchesDepartment = departmentFilter === 'All Departments' || member.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [search, statusFilter, departmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedMembers = filtered.slice(startIndex, startIndex + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, filtered.length);

  const summary = {
    total: teamMembers.length,
    present: teamMembers.filter((m) => m.status === 'Present').length,
    onLeave: teamMembers.filter((m) => m.status === 'On Leave').length,
    wfh: teamMembers.filter((m) => m.status === 'Work From Home').length,
  };

  const exportCsv = () => {
    const rows = [
      ['Employee ID', 'Name', 'Designation', 'Department', 'Status', 'Leave Balance'],
      ...filtered.map((member) => [
        member.id,
        member.name,
        member.designation,
        member.department,
        member.status,
        `${member.leaveUsed} Days / ${member.leaveTotal} Days`,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'my-team.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const resetPage = () => setPage(1);

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-transparent p-1 sm:p-2">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Team</h1>
            <p className="mt-1 text-sm text-slate-500">View and manage your team members</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50"
            >
              <Upload className="h-4 w-4" />
              Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
              <BarChart3 className="h-4 w-4" />
              Team Analytics
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Users className="h-5 w-5" />}
            iconClass="bg-sky-50 text-sky-600"
            value={summary.total}
            label="Total Members"
          />
          <SummaryCard
            icon={<UserCheck className="h-5 w-5" />}
            iconClass="bg-emerald-50 text-emerald-600"
            value={summary.present}
            label="Present Today"
          />
          <SummaryCard
            icon={<CalendarPlus className="h-5 w-5" />}
            iconClass="bg-orange-50 text-orange-600"
            value={summary.onLeave}
            label="On Leave"
          />
          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            iconClass="bg-violet-50 text-violet-600"
            value={summary.wfh}
            label="Work From Home"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 lg:max-w-sm">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
                placeholder="Search team members..."
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={statusFilter}
                options={statuses}
                onChange={(value) => {
                  setStatusFilter(value);
                  resetPage();
                }}
              />
              <FilterSelect
                value={departmentFilter}
                options={departments}
                onChange={(value) => {
                  setDepartmentFilter(value);
                  resetPage();
                }}
              />
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Leave Balance</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedMembers.map((member) => (
                  <tr key={member.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${member.avatarTone}`}>
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{member.designation}</td>
                    <td className="px-5 py-4 text-slate-600">{member.department}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[member.status]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {member.leaveUsed} Days / {member.leaveTotal} Days
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <ActionButton label="View">
                          <Eye className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton label="Documents">
                          <FileText className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton label="Email">
                          <Mail className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton label="More">
                          <MoreVertical className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {pagedMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      No team members match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {showingFrom} to {showingTo} of {filtered.length} members
            </p>
            <div className="flex items-center gap-1">
              <PaginationButton
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                ariaLabel="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationButton>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                    pageNumber === currentPage
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <PaginationButton
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                ariaLabel="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationButton>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  iconClass,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconClass: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-slate-600 outline-none transition hover:bg-slate-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
    </label>
  );
}

function ActionButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
    </button>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
