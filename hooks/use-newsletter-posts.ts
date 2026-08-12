'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  canManageNewsletter,
  canCreateNewsletter,
  canDeleteNewsletter,
  canEditNewsletter,
  canPublishNewsletter,
  canViewNewsletter,
} from '@/lib/newsletter/permissions';
import {
  deleteNewsletterPostViaApi,
  getNewsletterPostsSnapshot,
  getServerNewsletterPostsSnapshot,
  listPostsByCategory,
  listPublishedPosts,
  publishNewsletterPostViaApi,
  refreshNewsletterPostsFromApi,
  subscribeNewsletterPosts,
  toAnnouncementShape,
  toCompanyNewsShape,
  updateNewsletterPostViaApi,
} from '@/lib/newsletter/client-store';
import type { NewsletterCategory, PublishedAttachment, PublishedPost } from '@/lib/newsletter/types';

export function useNewsletterPosts() {
  const { user, token } = useAuth();
  const posts = useSyncExternalStore(
    subscribeNewsletterPosts,
    getNewsletterPostsSnapshot,
    getServerNewsletterPostsSnapshot,
  );

  const auth = useMemo(
    () => ({
      token,
      employeeId: user?.employeeId,
      userName: user?.name ?? user?.email,
      actorId: user?.id,
      actorEmail: user?.email,
      actorRole: user?.role,
    }),
    [token, user],
  );

  const permissions = useMemo(
    () => ({
      canView: canViewNewsletter(user?.role),
      canManage: canManageNewsletter(user?.role),
      canCreate: canCreateNewsletter(user?.role),
      canEdit: canEditNewsletter(user?.role),
      canDelete: canDeleteNewsletter(user?.role),
      canPublish: canPublishNewsletter(user?.role),
    }),
    [user?.role],
  );

  useEffect(() => {
    if (!user || !permissions.canView) return;
    void refreshNewsletterPostsFromApi(auth).catch(() => {
      // Keep local cache if API is unavailable during soft failures.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when identity/role changes
  }, [user?.id, user?.role, permissions.canView, token]);

  const publish = useCallback(
    async (input: {
      title: string;
      category: NewsletterCategory;
      body: string;
      author: string;
      authorImage?: string;
      attachment?: PublishedAttachment;
    }) => {
      if (!permissions.canPublish) {
        throw new Error('Forbidden: you do not have permission to publish newsletters.');
      }
      return publishNewsletterPostViaApi(input, auth);
    },
    [auth, permissions.canPublish],
  );

  const update = useCallback(
    async (input: {
      id: string;
      title: string;
      category: NewsletterCategory;
      body: string;
      attachment?: PublishedAttachment | null;
    }) => {
      if (!permissions.canEdit) {
        throw new Error('Forbidden: you do not have permission to edit newsletters.');
      }
      return updateNewsletterPostViaApi(input, auth);
    },
    [auth, permissions.canEdit],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!permissions.canDelete) {
        throw new Error('Forbidden: you do not have permission to delete newsletters.');
      }
      return deleteNewsletterPostViaApi(id, auth);
    },
    [auth, permissions.canDelete],
  );

  return {
    posts,
    all: listPublishedPosts(),
    permissions,
    byCategory: (category: NewsletterCategory) => listPostsByCategory(category),
    publish,
    update,
    remove,
    refresh: () => refreshNewsletterPostsFromApi(auth),
    asCompanyNews: () => listPostsByCategory('Company News').map(toCompanyNewsShape),
    asAnnouncements: () => listPostsByCategory('Important Announcement').map(toAnnouncementShape),
    asPolicyUpdates: () =>
      listPostsByCategory('Policy & HR Updates').map((post) => ({
        id: post.id,
        title: post.title,
        category: 'HR' as const,
        effective: post.publishedDateLabel,
        body: post.body,
        attachment: post.attachment,
      })),
    asLearning: () =>
      listPostsByCategory('Learning & Training').map((post) => ({
        id: post.id,
        title: post.title,
        meta: `Published · ${post.publishedDateLabel}`,
        seats: 'New',
        body: post.body,
        attachment: post.attachment,
      })),
  };
}

export type { PublishedPost };
