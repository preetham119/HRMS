import {
  NEWSLETTER_CATEGORIES,
  formatPublishedDate,
  type NewsletterCategory,
  type PublishedAttachment,
  type PublishedPost,
} from '@/lib/newsletter/types';

const globalForNewsletter = globalThis as unknown as {
  __hrmsNewsletterPosts?: PublishedPost[];
};

function uid() {
  return `NL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getNewsletterPostsStore(): PublishedPost[] {
  if (!globalForNewsletter.__hrmsNewsletterPosts) {
    globalForNewsletter.__hrmsNewsletterPosts = [];
  }
  return globalForNewsletter.__hrmsNewsletterPosts;
}

export function listServerNewsletterPosts() {
  return getNewsletterPostsStore()
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function findServerNewsletterPost(id: string) {
  return getNewsletterPostsStore().find((item) => item.id === id) ?? null;
}

export function isValidNewsletterCategory(value: string): value is NewsletterCategory {
  return (NEWSLETTER_CATEGORIES as readonly string[]).includes(value);
}

export function publishServerNewsletterPost(input: {
  title: string;
  category: NewsletterCategory;
  body: string;
  author: string;
  authorImage?: string;
  attachment?: PublishedAttachment;
}): PublishedPost {
  const now = new Date();
  const post: PublishedPost = {
    id: uid(),
    title: input.title.trim(),
    category: input.category,
    body: input.body.trim(),
    author: input.author,
    authorImage: input.authorImage,
    publishedAt: now.toISOString(),
    publishedDateLabel: formatPublishedDate(now),
    attachment: input.attachment,
  };
  getNewsletterPostsStore().unshift(post);
  return post;
}

export function updateServerNewsletterPost(
  id: string,
  input: {
    title: string;
    category: NewsletterCategory;
    body: string;
    attachment?: PublishedAttachment | null;
  },
): PublishedPost {
  const store = getNewsletterPostsStore();
  const index = store.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Newsletter not found.');

  const current = store[index];
  const next: PublishedPost = {
    ...current,
    title: input.title.trim(),
    category: input.category,
    body: input.body.trim(),
    attachment:
      input.attachment === null
        ? undefined
        : input.attachment !== undefined
          ? input.attachment
          : current.attachment,
  };
  store[index] = next;
  return next;
}

export function deleteServerNewsletterPost(id: string) {
  const store = getNewsletterPostsStore();
  const index = store.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Newsletter not found.');
  const [removed] = store.splice(index, 1);
  return removed;
}
