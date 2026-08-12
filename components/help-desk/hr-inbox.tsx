'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { HelpDeskHeader } from '@/components/help-desk/help-desk-header';
import { TicketList } from '@/components/help-desk/ticket-list';
import { TICKET_STATUSES } from '@/lib/help-desk/constants';
import { canViewHelpDeskInbox } from '@/lib/help-desk/permissions';
import { getTickets } from '@/lib/help-desk/store';
import type { HelpDeskTicket, TicketStatus } from '@/lib/help-desk/types';

export default function HrInbox() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<HelpDeskTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isReady) return;
    if (!canViewHelpDeskInbox(user?.role)) {
      router.replace('/help-desk?unauthorized=1');
      return;
    }
    setTickets(getTickets());
  }, [isReady, router, user?.role]);

  const filtered = useMemo(() => {
    return tickets
      .filter((ticket) => (statusFilter === 'All' ? true : ticket.status === statusFilter))
      .filter((ticket) =>
        `${ticket.ticketId} ${ticket.title} ${ticket.createdByName} ${ticket.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [search, statusFilter, tickets]);

  if (!isReady || !canViewHelpDeskInbox(user?.role)) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HelpDeskHeader
        eyebrow="HR"
        title="View all requests"
        description="Manage all employee support requests — assign, update status, and resolve."
        action={
          <Link
            href="/help-desk/raise"
            className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Raise request
          </Link>
        }
      />

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tickets, requester, category"
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'All' | TicketStatus)}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="All">All statuses</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <TicketList tickets={filtered} emptyMessage="No tickets match your filters." />
    </div>
  );
}
