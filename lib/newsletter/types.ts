export const NEWSLETTER_CATEGORIES = [
  'Company News',
  'Important Announcement',
  'Policy & HR Updates',
  'Learning & Training',
] as const;

export type NewsletterCategory = (typeof NEWSLETTER_CATEGORIES)[number];

export type PublishedAttachment = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
};

export type PublishedPost = {
  id: string;
  title: string;
  category: NewsletterCategory;
  body: string;
  author: string;
  authorImage?: string;
  publishedAt: string;
  publishedDateLabel: string;
  attachment?: PublishedAttachment;
};

export function formatPublishedDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
