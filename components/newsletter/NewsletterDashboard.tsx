'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Cake,
  CalendarDays,
  FileText,
  MailPlus,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { AnniversariesSection, BirthdaysSection } from '@/components/newsletter/celebration-sections';
import { CompanyNewsSection } from '@/components/newsletter/company-news-section';
import {
  AnnouncementsSection,
  LearningSection,
  NewJoinersSection,
  PolicyUpdatesSection,
  WellnessSection,
} from '@/components/newsletter/market-sections';
import {
  announcements as seedAnnouncements,
  employees,
  learningHighlights as seedLearning,
  newsletterTabs,
  newsletters as seedNewsletters,
  policyUpdates as seedPolicy,
  type NewsletterIssue,
  type NewsletterTab,
} from '@/components/newsletter/newsletter-data';
import { useNewsletterPosts } from '@/hooks/use-newsletter-posts';
import { canCreateNewsletter, canManageNewsletter } from '@/lib/newsletter/permissions';

export default function NewsletterDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const justPublished = searchParams.get('published') === '1';
  const justGreeted = searchParams.get('greeted') === '1';
  const { asCompanyNews, asAnnouncements, asPolicyUpdates, asLearning, all, remove, permissions } =
    useNewsletterPosts();

  const canCreate = canCreateNewsletter(user?.role);
  const canManage = canManageNewsletter(user?.role);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<NewsletterTab>('All');
  const [actionError, setActionError] = useState('');

  const filteredBirthdays = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(search.toLowerCase()) ||
          employee.id.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const filteredAnniversaries = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(search.toLowerCase()) ||
          employee.id.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const companyNewsIssues = useMemo(() => {
    const published = asCompanyNews() as NewsletterIssue[];
    const merged = [...published, ...seedNewsletters];
    const query = search.toLowerCase();
    return merged.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [asCompanyNews, search, all]);

  const announcementItems = useMemo(() => {
    const published = asAnnouncements();
    const merged = [...published, ...seedAnnouncements];
    const query = search.toLowerCase();
    if (!query) return merged;
    return merged.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.body.toLowerCase().includes(query),
    );
  }, [asAnnouncements, search, all]);

  const policyItems = useMemo(() => {
    const published = asPolicyUpdates();
    return [...published, ...seedPolicy];
  }, [asPolicyUpdates, all]);

  const learningItems = useMemo(() => {
    const published = asLearning();
    return [...published, ...seedLearning];
  }, [asLearning, all]);

  const activeBirthdays = activeTab === 'All' || activeTab === 'Birthdays';
  const activeAnniversaries = activeTab === 'All' || activeTab === 'Anniversaries';
  const activeNewsletters = activeTab === 'All' || activeTab === 'Company News';
  const showMarketExtras = activeTab === 'All';

  const displayDate = 'Friday, Jun 29, 2024';

  return (
    <div className="space-y-6">
      {justPublished && canManage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Newsletter published successfully. It now appears in the matching section below.
        </div>
      ) : null}

      {justGreeted ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Your greeting was sent successfully.
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>
      ) : null}

      <header className="overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="relative border-b border-slate-100 bg-slate-950 px-6 py-7 text-white sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-sky-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">People & Culture</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Newsletter Hub</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Stay connected with birthdays, anniversaries, company news, and the latest people updates —
                all in one workspace.
              </p>
            </div>
            {canCreate ? (
              <Link
                href="/newsletter/create"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-50"
              >
                <MailPlus className="h-4 w-4" />
                Create Newsletter
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-100 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
          <StatChip icon={Cake} label="Birthdays" value={String(filteredBirthdays.length)} hint="This week" />
          <StatChip icon={Star} label="Anniversaries" value={String(filteredAnniversaries.length)} hint="Upcoming" />
          <StatChip icon={FileText} label="News issues" value={String(companyNewsIssues.length)} hint="Published" />
          <StatChip icon={Users} label="New joiners" value="2" hint="This month" />
        </div>

        <div className="space-y-4 px-6 py-5 sm:px-8">
          <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Edition date</p>
                <p className="text-sm font-semibold text-slate-900">{displayDate}</p>
              </div>
            </div>
            <label className="relative block">
              <span className="sr-only">Search newsletters and people</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, employee ID, or newsletter title"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Newsletter filters">
            {newsletterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {activeBirthdays ? (
          <div className="h-full">
            <BirthdaysSection people={filteredBirthdays} />
          </div>
        ) : null}
        {activeAnniversaries ? (
          <div className="h-full">
            <AnniversariesSection people={filteredAnniversaries} />
          </div>
        ) : null}
        {showMarketExtras ? (
          <div className="h-full">
            <NewJoinersSection />
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {activeNewsletters ? (
          <CompanyNewsSection
            issues={companyNewsIssues}
            className={showMarketExtras ? 'h-full xl:col-span-2' : 'xl:col-span-3'}
            canManage={permissions.canManage}
            onDelete={async (id) => {
              setActionError('');
              try {
                await remove(id);
              } catch (err) {
                setActionError(err instanceof Error ? err.message : 'Failed to delete newsletter');
              }
            }}
          />
        ) : null}
        {showMarketExtras ? <AnnouncementsSection items={announcementItems} /> : null}
      </div>

      {showMarketExtras ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <PolicyUpdatesSection items={policyItems} />
          <LearningSection items={learningItems} />
          <WellnessSection />
        </div>
      ) : null}
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Cake;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">
          {value} <span className="font-normal text-slate-400">· {hint}</span>
        </p>
      </div>
    </div>
  );
}
