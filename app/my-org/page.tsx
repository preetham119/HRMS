'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  FlaskConical,
  Headphones,
  Landmark,
  MapPin,
  MapPinned,
  Search,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { getOrganizationSettings } from '@/lib/settings';
import { cn } from '@/lib/utils';

type OrgLocation = 'Hyderabad' | 'New Jersey';

type OrgMember = {
  name: string;
  designation: string;
  location: OrgLocation;
};

type OrgBranch = {
  id: string;
  code: string;
  label: string;
  headcount: number;
  location: OrgLocation;
  icon: LucideIcon;
  accent: string;
  soft: string;
  connector: string;
  lead: OrgMember;
  members: OrgMember[];
};

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir', 'Isha', 'Vikram', 'Neha', 'Arjun', 'Meera',
  'Siddharth', 'Divya', 'Karan', 'Sneha', 'Rahul', 'Pooja', 'Aditya', 'Nisha', 'Harsh', 'Tanvi',
  'Manish', 'Kritika', 'Suresh', 'Aisha', 'Nikhil', 'Ritu', 'Varun', 'Shreya', 'Deepak', 'Lavanya',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Gupta', 'Singh', 'Mehta', 'Kapoor', 'Das',
  'Joshi', 'Rao', 'Malhotra', 'Banerjee', 'Chopra',
];

function buildMembers(
  count: number,
  designations: string[],
  lead: OrgMember,
  location: OrgMember['location'],
  seed: number,
): OrgMember[] {
  const list: OrgMember[] = [lead];
  for (let i = 1; i < count; i += 1) {
    list.push({
      name: `${FIRST_NAMES[(seed + i) % FIRST_NAMES.length]} ${LAST_NAMES[(seed * 2 + i) % LAST_NAMES.length]}`,
      designation: designations[i % designations.length],
      location,
    });
  }
  return list;
}

const branchDefs: Omit<OrgBranch, 'members'>[] = [
  {
    id: 'web',
    code: 'WEB',
    label: 'Web Engineering',
    headcount: 30,
    location: 'Hyderabad',
    icon: Code2,
    accent: 'bg-sky-600',
    soft: 'bg-sky-50 text-sky-700 ring-sky-100',
    connector: 'bg-sky-300',
    lead: { name: 'Anita Desai', designation: 'Head of Web Engineering', location: 'Hyderabad' },
  },
  {
    id: 'qa',
    code: 'QA',
    label: 'Quality Assurance',
    headcount: 24,
    location: 'Hyderabad',
    icon: FlaskConical,
    accent: 'bg-violet-600',
    soft: 'bg-violet-50 text-violet-700 ring-violet-100',
    connector: 'bg-violet-300',
    lead: { name: 'Neha Joshi', designation: 'QA Director', location: 'Hyderabad' },
  },
  {
    id: 'sap',
    code: 'SAP',
    label: 'SAP Practice',
    headcount: 30,
    location: 'Hyderabad',
    icon: Landmark,
    accent: 'bg-amber-600',
    soft: 'bg-amber-50 text-amber-800 ring-amber-100',
    connector: 'bg-amber-300',
    lead: { name: 'Vikram Shah', designation: 'SAP Practice Lead', location: 'Hyderabad' },
  },
  {
    id: 'onsite',
    code: 'ONSITE',
    label: 'Onsite Delivery',
    headcount: 10,
    location: 'New Jersey',
    icon: MapPinned,
    accent: 'bg-emerald-600',
    soft: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    connector: 'bg-emerald-300',
    lead: { name: 'Rahul Verma', designation: 'Onsite Delivery Manager', location: 'New Jersey' },
  },
  {
    id: 'itsd',
    code: 'ITSD',
    label: 'IT Service Desk',
    headcount: 5,
    location: 'Hyderabad',
    icon: Headphones,
    accent: 'bg-slate-700',
    soft: 'bg-slate-100 text-slate-700 ring-slate-200',
    connector: 'bg-slate-300',
    lead: { name: 'Karan Mehta', designation: 'ITSD Lead', location: 'Hyderabad' },
  },
];

const branches: OrgBranch[] = branchDefs.map((branch, index) => {
  const pools: Record<string, string[]> = {
    web: ['Senior Frontend Engineer', 'Backend Engineer', 'Full Stack Developer', 'UI Engineer', 'Tech Lead', 'Software Engineer'],
    qa: ['QA Lead', 'Automation Engineer', 'SDET', 'Manual QA Analyst', 'Performance Tester', 'QA Engineer'],
    sap: ['SAP ABAP Consultant', 'SAP FICO Consultant', 'SAP MM Consultant', 'SAP Basis Admin', 'SAP Functional Lead', 'SAP Integration Specialist'],
    onsite: ['Onsite Coordinator', 'Client Engagement Lead', 'Delivery Consultant', 'Site Engineer', 'Account Lead'],
    itsd: ['L1 Support Engineer', 'L2 Support Engineer', 'Service Desk Analyst', 'IT Operations Specialist'],
  };

  return {
    ...branch,
    members: buildMembers(branch.headcount, pools[branch.id], branch.lead, branch.location, (index + 1) * 9),
  };
});

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function TreeNode({
  title,
  subtitle,
  meta,
  tone = 'default',
  icon,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  tone?: 'root' | 'branch' | 'lead' | 'default';
  icon?: LucideIcon;
}) {
  const Icon = icon;

  return (
    <div
      className={cn(
        'relative z-10 w-full max-w-[240px] rounded-2xl border px-4 py-3 text-center shadow-[0_14px_30px_-22px_rgba(15,23,42,0.55)]',
        tone === 'root' && 'border-slate-800 bg-slate-950 text-white',
        tone === 'branch' && 'border-slate-200 bg-white',
        tone === 'lead' && 'border-slate-200 bg-white',
        tone === 'default' && 'border-slate-200 bg-white',
      )}
    >
      {Icon ? (
        <div className="mb-2 flex justify-center">
          <span
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-xl',
              tone === 'root' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700',
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
      ) : (
        <div className="mb-2 flex justify-center">
          <span
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
              tone === 'root' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700',
            )}
          >
            {initials(title)}
          </span>
        </div>
      )}
      <p className={cn('text-sm font-semibold', tone === 'root' ? 'text-white' : 'text-slate-900')}>{title}</p>
      <p className={cn('mt-0.5 text-xs', tone === 'root' ? 'text-slate-300' : 'text-slate-500')}>{subtitle}</p>
      {meta ? (
        <p className={cn('mt-2 text-[11px] font-medium', tone === 'root' ? 'text-slate-400' : 'text-slate-400')}>
          {meta}
        </p>
      ) : null}
    </div>
  );
}

export default function MyOrgPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('web');
  const org = useMemo(() => getOrganizationSettings(), []);

  const totalHeadcount = useMemo(
    () => branches.reduce((sum, branch) => sum + branch.headcount, 0),
    [],
  );

  const selected = useMemo(
    () => branches.find((branch) => branch.id === selectedId) ?? branches[0],
    [selectedId],
  );

  const visibleMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const team = selected.members.filter((member) => member.name !== selected.lead.name);
    if (!q) return team;
    return team.filter((member) =>
      `${member.name} ${member.designation}`.toLowerCase().includes(q),
    );
  }, [search, selected]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Organization tree</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">My Org</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {org.companyName} · {org.headquarters || 'Headquarters'} · {org.currency} · FY starts {org.fiscalYearStart}.
              Select a branch to expand the tree.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter people in selected unit"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total headcount</p>
            <div className="mt-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <p className="text-2xl font-semibold text-slate-900">{totalHeadcount}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Locations</p>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <p className="text-2xl font-semibold text-slate-900">2</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">Hyderabad · New Jersey</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top,#eef2ff_0%,#ffffff_55%)] px-4 py-8 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center">
            {/* Level 1 — CEO */}
            <TreeNode
              title={user?.name || 'Arjun Mehta'}
              subtitle="Chief Executive Officer"
              meta="Executive Office"
              tone="root"
            />

            <div className="h-10 w-px bg-slate-300" />

            {/* Level 2 — Units */}
            <div className="relative w-full">
              <div className="absolute left-[10%] right-[10%] top-0 h-px bg-slate-300" />
              <div className="grid grid-cols-2 gap-4 pt-0 md:grid-cols-5">
                {branches.map((branch) => {
                  const Icon = branch.icon;
                  const active = selectedId === branch.id;
                  return (
                    <div key={branch.id} className="flex flex-col items-center">
                      <div className="h-10 w-px bg-slate-300" />
                      <button
                        type="button"
                        onClick={() => setSelectedId(branch.id)}
                        className={cn(
                          'w-full rounded-2xl border px-3 py-3 text-center transition',
                          active
                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-md',
                        )}
                      >
                        <div className="flex justify-center">
                          <span
                            className={cn(
                              'inline-flex h-8 w-8 items-center justify-center rounded-xl',
                              active ? 'bg-white/15 text-white' : cn('text-white', branch.accent),
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                          {branch.code}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{branch.label}</p>
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs opacity-80">
                          <span className={cn('rounded-full px-2 py-0.5 font-semibold ring-1', active ? 'bg-white/10 ring-white/20' : branch.soft)}>
                            {branch.headcount}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {branch.location}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Level 3 / 4 — Selected branch tree */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-8 sm:px-8"
          >
            <div className="mx-auto flex max-w-5xl flex-col items-center">
              <div className={cn('mb-2 h-8 w-px', selected.connector)} />

              <TreeNode
                title={selected.lead.name}
                subtitle={selected.lead.designation}
                meta={`${selected.code} Lead · ${selected.location}`}
                tone="lead"
              />

              <div className={cn('h-8 w-px', selected.connector)} />

              <div className="relative w-full">
                <div className={cn('absolute left-4 right-4 top-0 h-px md:left-8 md:right-8', selected.connector)} />
                <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleMembers.map((member, index) => (
                    <div key={`${selected.id}-${index}-${member.name}`} className="relative flex flex-col items-center">
                      <div className={cn('absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2', selected.connector)} />
                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            {initials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
                            <p className="truncate text-xs text-slate-500">{member.designation}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="h-3 w-3" />
                              {member.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {visibleMembers.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">No people match your filter in {selected.code}.</p>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
