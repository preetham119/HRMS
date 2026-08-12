import type { AppRole } from '@/lib/auth';

/**
 * Learning RBAC — mapped from empL&D roles:
 * Employee → EMPLOYEE / FINANCE
 * Trainer → MANAGER
 * Admin → HR / ADMIN
 */
export type LearningPermission =
  | 'learning:view'
  | 'learning:enroll'
  | 'learning:quiz'
  | 'learning:assignment'
  | 'learning:trainer'
  | 'learning:admin';

const ROLE_PERMISSIONS: Record<AppRole, readonly LearningPermission[]> = {
  EMPLOYEE: ['learning:view', 'learning:enroll', 'learning:quiz', 'learning:assignment'],
  FINANCE: ['learning:view', 'learning:enroll', 'learning:quiz', 'learning:assignment'],
  MANAGER: [
    'learning:view',
    'learning:enroll',
    'learning:quiz',
    'learning:assignment',
    'learning:trainer',
  ],
  HR: [
    'learning:view',
    'learning:enroll',
    'learning:quiz',
    'learning:assignment',
    'learning:admin',
  ],
  ADMIN: [
    'learning:view',
    'learning:enroll',
    'learning:quiz',
    'learning:assignment',
    'learning:admin',
  ],
  CEO: ['learning:view', 'learning:enroll', 'learning:quiz', 'learning:assignment'],
};

export function getLearningPermissions(role: AppRole | null | undefined): LearningPermission[] {
  if (!role) return [];
  return [...(ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.EMPLOYEE)];
}

export function hasLearningPermission(
  role: AppRole | null | undefined,
  permission: LearningPermission,
) {
  return getLearningPermissions(role).includes(permission);
}

/** Trainer workspace — Manager role (empL&D Trainer). */
export function canAccessTrainerWorkspace(role: AppRole | null | undefined) {
  return hasLearningPermission(role, 'learning:trainer');
}

/** HR console — HR / Admin (empL&D Admin). */
export function canAccessLearningAdmin(role: AppRole | null | undefined) {
  return hasLearningPermission(role, 'learning:admin');
}
