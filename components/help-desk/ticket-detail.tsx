'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { HelpDeskHeader } from '@/components/help-desk/help-desk-header';
import { PriorityBadge, StatusBadge } from '@/components/help-desk/status-badge';
import { HELP_DESK_ASSIGNEES } from '@/lib/help-desk/assignees';
import { TICKET_STATUSES } from '@/lib/help-desk/constants';
import { canManageHelpDesk } from '@/lib/help-desk/permissions';
import {
  addTicketComment,
  assignTicket,
  getTicketById,
  updateTicketStatus,
} from '@/lib/help-desk/store';
import type { HelpDeskTicket, TicketStatus } from '@/lib/help-desk/types';

export default function TicketDetail({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<HelpDeskTicket | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [resolution, setResolution] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const canManage = canManageHelpDesk(user?.role);

  useEffect(() => {
    const found = getTicketById(ticketId);
    setTicket(found);
    if (found) {
      setStatus(found.status);
      setResolution(found.resolution);
      setAssigneeId(found.assignedTo ?? '');
    }
  }, [ticketId]);

  if (!ticket || !user) {
    return (
      <div className="space-y-6">
        <HelpDeskHeader title="Ticket not found" description="This request may have been removed." />
        <Link href="/help-desk" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
          <ArrowLeft className="h-4 w-4" />
          Back to IT Service Desk
        </Link>
      </div>
    );
  }

  const canView = canManage || ticket.createdBy === user.id;
  if (!canView) {
    return (
      <div className="space-y-6">
        <HelpDeskHeader title="Unauthorized" description="You can only view your own IT Service Desk requests." />
        <Link href="/help-desk" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
          <ArrowLeft className="h-4 w-4" />
          Back to IT Service Desk
        </Link>
      </div>
    );
  }

  const refresh = () => setTicket(getTicketById(ticket.id));

  return (
    <div className="space-y-6">
      <HelpDeskHeader
        title={ticket.title}
        description={`${ticket.ticketId} • Raised by ${ticket.createdByName}`}
        action={
          <Link
            href="/help-desk"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {ticket.category}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{ticket.description}</p>
          </div>

          {ticket.steps ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-500">Steps to reproduce</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{ticket.steps}</p>
            </div>
          ) : null}

          {ticket.attachments.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-500">Attachments</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {ticket.attachments.map((file) => (
                  <li key={file.id}>{file.name}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-slate-500">Add comment</h3>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Write an update…"
            />
            <button
              type="button"
              onClick={() => {
                if (!comment.trim()) return;
                addTicketComment(ticket.id, {
                  message: comment.trim(),
                  userName: user.name ?? user.email.split('@')[0],
                  userId: user.id,
                });
                setComment('');
                refresh();
              }}
              className="mt-3 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Post comment
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500">Comments</h3>
            <div className="mt-3 space-y-3">
              {ticket.comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet.</p>
              ) : (
                ticket.comments.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {item.userName}{' '}
                      <span className="font-normal text-slate-400">
                        · {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Requester</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">{ticket.createdByName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">{ticket.createdByEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Assignee</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">
                  {ticket.assignedToName ?? 'Unassigned'}
                </dd>
              </div>
              {ticket.resolution ? (
                <div>
                  <dt className="text-slate-500">Resolution</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">{ticket.resolution}</dd>
                </div>
              ) : null}
            </dl>

            {canManage ? (
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Assign to</span>
                  <select
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">Unassigned</option>
                    {HELP_DESK_ASSIGNEES.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.role})
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    const selected = HELP_DESK_ASSIGNEES.find((person) => person.id === assigneeId);
                    if (!selected) return;
                    assignTicket(
                      ticket.id,
                      selected.id,
                      selected.name,
                      user.name ?? 'HR Admin',
                    );
                    refresh();
                  }}
                  disabled={!assigneeId}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save assignee
                </button>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Update status</span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as TicketStatus)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    {TICKET_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <textarea
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                  rows={3}
                  placeholder="Resolution notes (optional)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                />

                <button
                  type="button"
                  onClick={() => {
                    updateTicketStatus(ticket.id, status, user.name ?? 'HR Admin', resolution);
                    refresh();
                  }}
                  className="w-full rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Save status
                </button>
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
