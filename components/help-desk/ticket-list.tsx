'use client';

import Link from 'next/link';
import { PriorityBadge, StatusBadge } from '@/components/help-desk/status-badge';
import type { HelpDeskTicket } from '@/lib/help-desk/types';

export function TicketList({
  tickets,
  emptyMessage = 'No requests found.',
}: {
  tickets: HelpDeskTicket[];
  emptyMessage?: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  <Link href={`/help-desk/tickets/${ticket.id}`} className="font-semibold text-brand-600 hover:text-brand-700">
                    {ticket.ticketId}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-100">{ticket.title}</td>
                <td className="px-4 py-3 text-slate-600">{ticket.category}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
