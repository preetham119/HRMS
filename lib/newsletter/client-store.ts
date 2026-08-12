'use client';

import {
  formatShortDate,
  type NewsletterCategory,
  type PublishedAttachment,
  type PublishedPost,
} from '@/lib/newsletter/types';

const STORAGE_KEY = 'hrms-newsletter-posts';

type Listener = () => void;

type AuthHeaders = {
  token?: string | null;
  employeeId?: string;
  userName?: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
};

function readStorage(): PublishedPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PublishedPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(posts: PublishedPost[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

let postsCache: PublishedPost[] | null = null;
const listeners = new Set<Listener>();

function getPosts() {
  if (postsCache === null) {
    postsCache = readStorage();
  }
  return postsCache;
}

function setPosts(next: PublishedPost[]) {
  postsCache = next;
  writeStorage(next);
  listeners.forEach((listener) => listener());
}

export function subscribeNewsletterPosts(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNewsletterPostsSnapshot() {
  return getPosts();
}

export function getServerNewsletterPostsSnapshot(): PublishedPost[] {
  return [];
}

export function listPublishedPosts() {
  return getPosts().slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function listPostsByCategory(category: NewsletterCategory) {
  return listPublishedPosts().filter((post) => post.category === category);
}

function authHeaders(auth?: AuthHeaders): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-auth-token': auth?.token ?? '',
    'x-employee-id': auth?.employeeId ?? '',
    'x-user-name': auth?.userName ?? '',
  };
}

function actorPayload(auth?: AuthHeaders) {
  return {
    actorId: auth?.actorId,
    actorEmail: auth?.actorEmail,
    actorName: auth?.userName,
    actorRole: auth?.actorRole,
  };
}

export async function refreshNewsletterPostsFromApi(auth?: AuthHeaders) {
  const response = await fetch('/api/newsletter', {
    headers: authHeaders(auth),
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load newsletters');
  }
  const posts = Array.isArray(data.posts) ? (data.posts as PublishedPost[]) : [];
  setPosts(posts);
  return posts;
}

export async function publishNewsletterPostViaApi(
  input: {
    title: string;
    category: NewsletterCategory;
    body: string;
    author: string;
    authorImage?: string;
    attachment?: PublishedAttachment;
  },
  auth?: AuthHeaders,
): Promise<PublishedPost> {
  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: authHeaders(auth),
    body: JSON.stringify({ ...actorPayload(auth), ...input }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to publish newsletter');
  }
  const post = data.post as PublishedPost;
  setPosts([post, ...getPosts().filter((item) => item.id !== post.id)]);
  return post;
}

export async function updateNewsletterPostViaApi(
  input: {
    id: string;
    title: string;
    category: NewsletterCategory;
    body: string;
    attachment?: PublishedAttachment | null;
  },
  auth?: AuthHeaders,
): Promise<PublishedPost> {
  const response = await fetch('/api/newsletter', {
    method: 'PATCH',
    headers: authHeaders(auth),
    body: JSON.stringify({ ...actorPayload(auth), ...input }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update newsletter');
  }
  const post = data.post as PublishedPost;
  setPosts(getPosts().map((item) => (item.id === post.id ? post : item)));
  return post;
}

export async function deleteNewsletterPostViaApi(id: string, auth?: AuthHeaders) {
  const response = await fetch('/api/newsletter', {
    method: 'DELETE',
    headers: authHeaders(auth),
    body: JSON.stringify({ ...actorPayload(auth), id }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete newsletter');
  }
  setPosts(getPosts().filter((item) => item.id !== id));
  return data.post as PublishedPost;
}

export function toAnnouncementShape(post: PublishedPost) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    tone: 'info' as const,
    date: formatShortDate(new Date(post.publishedAt)),
    attachment: post.attachment,
  };
}

export function toCompanyNewsShape(post: PublishedPost) {
  return {
    id: post.id,
    title: post.title,
    category: post.category,
    publishedDate: post.publishedDateLabel,
    author: post.author,
    authorImage:
      post.authorImage ||
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=60',
    description: post.body,
    attachment: post.attachment,
  };
}
