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

const EMPLOYEE_LEARNING: readonly LearningPermission[] = [
  'learning:view',
  'learning:enroll',
  'learning:quiz',
  'learning:assignment',
];

const ROLE_PERMISSIONS: Record<AppRole, readonly LearningPermission[]> = {
  EMPLOYEE_PR: EMPLOYEE_LEARNING,
  EMPLOYEE_CONT: EMPLOYEE_LEARNING,
  FINANCE: EMPLOYEE_LEARNING,
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
  CEO: EMPLOYEE_LEARNING,
};

export function getLearningPermissions(role: AppRole | null | undefined): LearningPermission[] {
  if (!role) return [];
  return [...(ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.EMPLOYEE_PR)];
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
