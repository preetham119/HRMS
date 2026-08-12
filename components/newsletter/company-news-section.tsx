'use client';

import Link from 'next/link';
import { Download, FileText, Paperclip } from 'lucide-react';
import type { NewsletterIssue } from '@/components/newsletter/newsletter-data';
import { NewsletterEmptyState, NewsletterSectionCard } from '@/components/newsletter/newsletter-ui';

export function CompanyNewsSection({
  issues,
  className = 'xl:col-span-2',
  canManage = false,
  onDelete,
}: {
  issues: NewsletterIssue[];
  className?: string;
  canManage?: boolean;
  onDelete?: (id: string) => void | Promise<void>;
}) {
  return (
    <NewsletterSectionCard
      title="Company News"
      subtitle="Recent newsletter issues and updates"
      icon={FileText}
      accent="slate"
      className={className}
    >
      {issues.length ? (
        <div className="space-y-3">
          {issues.map((item) => {
            const isManagedPost = item.id.startsWith('NL-');
            return (
              <article
                key={item.id}
                tabIndex={0}
                aria-label={`Newsletter ${item.title} published on ${item.publishedDate}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.category}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold leading-snug text-slate-950 sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                    {item.attachment ? (
                      <a
                        href={item.attachment.dataUrl}
                        download={item.attachment.fileName}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        <span className="max-w-[180px] truncate">{item.attachment.fileName}</span>
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                    Published
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-200">
                      <img
                        src={
                          item.authorImage ??
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=60'
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.author}</p>
                      <p className="text-xs text-slate-500">Published on {item.publishedDate}</p>
                    </div>
                  </div>

                  {canManage ? (
                    <div className="flex flex-wrap items-center gap-1 text-sm font-medium text-sky-700">
                      {isManagedPost ? (
                        <>
                          <Link
                            href={`/newsletter/create?edit=${encodeURIComponent(item.id)}`}
                            className="rounded-lg px-2.5 py-1.5 transition hover:bg-sky-50"
                            aria-label={`Edit ${item.title}`}
                          >
                            Edit
                          </Link>
                          <span className="text-slate-300" aria-hidden>
                            |
                          </span>
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="rounded-lg px-2.5 py-1.5 transition hover:bg-sky-50"
                        aria-label={`View ${item.title}`}
                      >
                        View
                      </button>
                      {isManagedPost ? (
                        <>
                          <span className="text-slate-300" aria-hidden>
                            |
                          </span>
                          <button
                            type="button"
                            onClick={() => void onDelete?.(item.id)}
                            className="rounded-lg px-2.5 py-1.5 text-rose-600 transition hover:bg-rose-50"
                            aria-label={`Delete ${item.title}`}
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
                      aria-label={`View ${item.title}`}
                    >
                      View
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <NewsletterEmptyState
          icon={FileText}
          title="No recent newsletters available"
          description="Published company newsletters will show up here."
        />
      )}
    </NewsletterSectionCard>
  );
}
