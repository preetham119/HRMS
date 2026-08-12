'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Paperclip } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { HelpDeskHeader } from '@/components/help-desk/help-desk-header';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '@/lib/help-desk/constants';
import { createTicket } from '@/lib/help-desk/store';
import type { TicketAttachment, TicketCategory, TicketPriority } from '@/lib/help-desk/types';

export default function RaiseRequestForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('HR');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    setAttachments(
      files.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
      })),
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in to raise a request.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    const ticket = createTicket({
      title,
      category,
      priority,
      description,
      steps,
      attachments,
      createdBy: user.id,
      createdByName: user.name ?? user.email.split('@')[0],
      createdByEmail: user.email,
    });

    setSuccessId(ticket.ticketId);
    setSubmitting(false);

    window.setTimeout(() => {
      router.push(`/help-desk/tickets/${ticket.id}`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <HelpDeskHeader
        title="Raise request"
        description="Submit a support request to the IT Service Desk. Include clear details for faster resolution."
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        {successId ? (
          <div className="mb-4 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-700">
            Request submitted successfully as {successId}. Opening ticket…
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Brief summary of your request"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as TicketCategory)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            >
              {TICKET_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TicketPriority)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            >
              {TICKET_PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={4}
              placeholder="Describe the issue or request in detail"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Steps to reproduce (optional)
            </span>
            <textarea
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              rows={3}
              placeholder="List the steps that lead to the issue"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Attachments</span>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Paperclip className="h-4 w-4" />
                Upload up to 5 files
              </div>
              <input type="file" multiple onChange={handleFiles} className="mt-3 w-full text-sm" />
              {attachments.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {attachments.map((file) => (
                    <li key={file.id}>
                      {file.name} ({Math.max(1, Math.round(file.size / 1024))} KB)
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting || Boolean(successId)}
            className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/help-desk')}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
