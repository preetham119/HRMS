'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleDot, Clock3, Ticket } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { HelpDeskHeader } from '@/components/help-desk/help-desk-header';
import { TicketList } from '@/components/help-desk/ticket-list';
import { canViewHelpDeskInbox } from '@/lib/help-desk/permissions';
import { getTicketStats, getTicketsForUser } from '@/lib/help-desk/store';
import type { HelpDeskTicket } from '@/lib/help-desk/types';

export default function HelpDeskOverview() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<HelpDeskTicket[]>([]);
  const canSeeAll = canViewHelpDeskInbox(user?.role);

  useEffect(() => {
    if (!user) return;
    setTickets(getTicketsForUser(user.id, canSeeAll));
  }, [canSeeAll, user]);

  const stats = useMemo(() => getTicketStats(tickets), [tickets]);
  const recent = tickets.slice(0, 8);

  return (
    <div className="space-y-6">
      <HelpDeskHeader
        title="IT Service Desk"
        description="Raise support requests, track progress, and review ticket history."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/help-desk/raise"
              className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Raise request
            </Link>
            {canSeeAll ? (
              <Link
                href="/help-desk/inbox"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                  View all requests
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total requests', value: stats.total, icon: Ticket, tone: 'bg-[#EAF4FF] text-[#2563EB]' },
          { label: 'Open', value: stats.open, icon: CircleDot, tone: 'bg-[#FFF4E5] text-[#F97316]' },
          { label: 'In progress', value: stats.inProgress, icon: Clock3, tone: 'bg-[#F4EBFF] text-[#7C3AED]' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, tone: 'bg-[#E6FFFA] text-[#059669]' },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {canSeeAll ? 'Recent requests' : 'My requests'}
          </h2>
          <Link href={canSeeAll ? '/help-desk/inbox' : '/help-desk/raise'} className="text-sm font-semibold text-brand-600">
            {canSeeAll ? 'View all requests' : 'New request'}
          </Link>
        </div>
        <TicketList
          tickets={recent}
          emptyMessage="No requests yet. Raise a request to get started."
        />
      </div>
    </div>
  );
}
