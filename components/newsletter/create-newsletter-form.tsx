'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Loader2,
  Megaphone,
  Paperclip,
  Send,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useNewsletterPosts } from '@/hooks/use-newsletter-posts';
import {
  canCreateNewsletter,
  canEditNewsletter,
  canManageNewsletter,
  canPublishNewsletter,
  canUploadNewsletterAttachment,
} from '@/lib/newsletter/permissions';
import {
  NEWSLETTER_CATEGORIES,
  type NewsletterCategory,
  type PublishedAttachment,
} from '@/lib/newsletter/types';

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const categoryMeta: Record<
  NewsletterCategory,
  { description: string; icon: typeof FileText; accent: string; chip: string }
> = {
  'Company News': {
    description: 'Company-wide updates, culture stories, and monthly digests.',
    icon: FileText,
    accent: 'border-slate-300 ring-slate-200',
    chip: 'bg-slate-100 text-slate-700',
  },
  'Important Announcement': {
    description: 'Time-sensitive notices employees need to act on.',
    icon: Megaphone,
    accent: 'border-rose-300 ring-rose-100',
    chip: 'bg-rose-50 text-rose-700',
  },
  'Policy & HR Updates': {
    description: 'Policy changes, compliance notes, and HR process updates.',
    icon: FileText,
    accent: 'border-amber-300 ring-amber-100',
    chip: 'bg-amber-50 text-amber-800',
  },
  'Learning & Training': {
    description: 'Courses, workshops, and mandatory learning highlights.',
    icon: FileText,
    accent: 'border-indigo-300 ring-indigo-100',
    chip: 'bg-indigo-50 text-indigo-700',
  },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CreateNewsletterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user, isReady } = useAuth();
  const { publish, update, all } = useNewsletterPosts();

  const allowed =
    canManageNewsletter(user?.role) &&
    (editId ? canEditNewsletter(user?.role) : canCreateNewsletter(user?.role) && canPublishNewsletter(user?.role));
  const canUpload = canUploadNewsletterAttachment(user?.role);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsletterCategory>('Company News');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<PublishedAttachment | undefined>();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hydratedEdit, setHydratedEdit] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user || !allowed) {
      router.replace('/newsletter');
    }
  }, [allowed, isReady, router, user]);

  useEffect(() => {
    if (!editId || hydratedEdit) return;
    const existing = all.find((item) => item.id === editId);
    if (!existing) return;
    setTitle(existing.title);
    setCategory(existing.category);
    setBody(existing.body);
    setAttachment(existing.attachment);
    setHydratedEdit(true);
  }, [all, editId, hydratedEdit]);

  const selectedMeta = categoryMeta[category];
  const SelectedIcon = selectedMeta.icon;
  const charCount = body.trim().length;
  const canSubmit = title.trim().length >= 4 && body.trim().length >= 20 && !submitting && allowed;

  const previewSnippet = useMemo(() => {
    const text = body.trim();
    if (!text) return 'Your message preview will appear here.';
    return text.length > 160 ? `${text.slice(0, 160)}…` : text;
  }, [body]);

  const onFileChange = async (file: File | null) => {
    setError('');
    if (!file) return;
    if (!canUpload) {
      setError('You do not have permission to upload attachments.');
      return;
    }

    const allowedTypes =
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.(pdf|doc|docx)$/i.test(file.name);

    if (!allowedTypes) {
      setError('Please upload a PDF or Word document.');
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError('Attachment must be 10 MB or smaller.');
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    setAttachment({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
      dataUrl,
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!allowed) {
      setError('Forbidden: insufficient newsletter permissions.');
      return;
    }
    if (title.trim().length < 4) {
      setError('Title must be at least 4 characters.');
      return;
    }
    if (body.trim().length < 20) {
      setError('Please write at least 20 characters of content.');
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await update({
          id: editId,
          title,
          category,
          body,
          attachment: attachment ?? null,
        });
      } else {
        await publish({
          title,
          category,
          body,
          author: user?.name || user?.email || 'HR Admin',
          authorImage: user?.profilePicture || undefined,
          attachment,
        });
      }
      router.push('/newsletter?published=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish newsletter.');
      setSubmitting(false);
    }
  };

  if (!isReady || !user || !allowed) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Checking permissions…</p>
        <p className="mt-2 text-sm text-slate-500">Only HR can create or edit newsletters.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Newsletter Hub
        </Link>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${selectedMeta.chip}`}>
          <SelectedIcon className="h-3.5 w-3.5" />
          {editId ? 'Editing' : 'Publishing to'} {category}
        </span>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 bg-slate-950 px-6 py-6 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Compose</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {editId ? 'Edit Newsletter' : 'Create Newsletter'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Draft a titled update, choose the destination section, attach a supporting PDF if needed,
            then publish to the Newsletter Hub.
          </p>
        </div>

        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5 border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Q3 Benefits Enrollment Opens Monday"
                maxLength={120}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <span className="mt-1.5 block text-xs text-slate-400">{title.trim().length}/120</span>
            </label>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-800">Category</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {NEWSLETTER_CATEGORIES.map((option) => {
                  const meta = categoryMeta[option];
                  const Icon = meta.icon;
                  const selected = category === option;
                  return (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-2xl border bg-white p-4 transition ${
                        selected
                          ? `ring-2 ${meta.accent} shadow-sm`
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={option}
                        checked={selected}
                        onChange={() => setCategory(option)}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${meta.chip}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{option}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{meta.description}</span>
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Message</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={10}
                placeholder="Write the full announcement or newsletter content employees should read…"
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <span className="mt-1.5 block text-xs text-slate-400">
                {charCount} characters · minimum 20
              </span>
            </label>

            {canUpload ? (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">Attachment (optional)</p>
                {!attachment ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                    <Upload className="h-5 w-5 text-sky-600" />
                    <span className="mt-2 text-sm font-semibold text-slate-800">Upload PDF or Word file</span>
                    <span className="mt-1 text-xs text-slate-500">Max 10 MB · used as supporting document</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      className="hidden"
                      onChange={(event) => void onFileChange(event.target.files?.[0] ?? null)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200">
                        <Paperclip className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{attachment.fileName}</p>
                        <p className="text-xs text-slate-500">{formatBytes(attachment.fileSize)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(undefined)}
                      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {editId ? 'Save changes' : 'Publish'}
              </button>
              <Link
                href="/newsletter"
                className="inline-flex items-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </div>

          <aside className="space-y-4 bg-slate-50/80 p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live preview</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">How it will appear</h2>
            </div>
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{category}</p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">
                {title.trim() || 'Untitled update'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{previewSnippet}</p>
              {attachment ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Paperclip className="h-3.5 w-3.5" />
                  {attachment.fileName}
                </div>
              ) : null}
              <p className="mt-4 text-xs text-slate-400">
                Author: {user?.name || user?.email || 'HR Admin'}
              </p>
            </article>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-900">
              Publishing is restricted to HR. Employees and managers can view and download published
              content from the Newsletter Hub.
            </div>
          </aside>
        </form>
      </section>
    </div>
  );
}
