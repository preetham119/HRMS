import type { AppRole } from '@/lib/auth';

/**
 * Newsletter RBAC matrix — extend here when adding roles/actions.
 * Readers: view + download
 * Managers (HR/Admin): create, edit, delete, publish, upload
 */
export type NewsletterPermission =
  | 'newsletter:view'
  | 'newsletter:download'
  | 'newsletter:create'
  | 'newsletter:edit'
  | 'newsletter:delete'
  | 'newsletter:publish'
  | 'newsletter:upload';

const EMPLOYEE_NEWSLETTER: readonly NewsletterPermission[] = ['newsletter:view', 'newsletter:download'];

const ROLE_PERMISSIONS: Record<AppRole, readonly NewsletterPermission[]> = {
  EMPLOYEE_PR: EMPLOYEE_NEWSLETTER,
  EMPLOYEE_CONT: EMPLOYEE_NEWSLETTER,
  MANAGER: ['newsletter:view', 'newsletter:download'],
  FINANCE: ['newsletter:view', 'newsletter:download'],
  HR: [
    'newsletter:view',
    'newsletter:download',
    'newsletter:create',
    'newsletter:edit',
    'newsletter:delete',
    'newsletter:publish',
    'newsletter:upload',
  ],
  ADMIN: [
    'newsletter:view',
    'newsletter:download',
    'newsletter:create',
    'newsletter:edit',
    'newsletter:delete',
    'newsletter:publish',
    'newsletter:upload',
  ],
  CEO: [
    'newsletter:view',
    'newsletter:download',
    'newsletter:create',
    'newsletter:edit',
    'newsletter:delete',
    'newsletter:publish',
    'newsletter:upload',
  ],
};

export function getNewsletterPermissions(role: AppRole | null | undefined): NewsletterPermission[] {
  if (!role) return [];
  return [...(ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.EMPLOYEE_PR)];
}

export function hasNewsletterPermission(
  role: AppRole | null | undefined,
  permission: NewsletterPermission,
) {
  return getNewsletterPermissions(role).includes(permission);
}

export function canViewNewsletter(role: AppRole | null | undefined) {
  return hasNewsletterPermission(role, 'newsletter:view');
}

export function canDownloadNewsletter(role: AppRole | null | undefined) {
  return hasNewsletterPermission(role, 'newsletter:download');
}

/** Create / edit / delete / publish / upload — HR, Admin & CEO. */
export function canManageNewsletter(role: AppRole | null | undefined) {
  return (
    hasNewsletterPermission(role, 'newsletter:create') &&
    hasNewsletterPermission(role, 'newsletter:publish')
  );
}

export function canCreateNewsletter(role: AppRole | null | undefined) {
  return hasNewsletterPermission(role, 'newsletter:create');
}

export function canEditNewsletter(role: AppRole | null | undefined) {
  return hasNewsletterPermission(role, 'newsletter:edit');
}

export function canDeleteNewsletter(role: AppRole | null | undefined) {
  return hasNewsletterPermission(role, 'newsletter:delete');
}

export function canPublishNewsletter(role: AppRole | null | undefined) {
  return hasNewsletterPermission(role, 'newsletter:publish');
}

export function canUploadNewsletterAttachment(role: AppRole | null | undefined) {
  return hasNewsletterPermission(role, 'newsletter:upload');
}

export function assertNewsletterPermission(
  role: AppRole | null | undefined,
  permission: NewsletterPermission,
) {
  if (!hasNewsletterPermission(role, permission)) {
    throw new Error('Forbidden: insufficient newsletter permissions.');
  }
}
