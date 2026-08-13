import type { AppRole } from '@/lib/auth';

/**
 * IT Service Desk RBAC — mapped from Service Desk:
 * Employee → EMPLOYEE / MANAGER / FINANCE
 * Admin → HR / ADMIN
 */
export type HelpDeskPermission =
  | 'helpdesk:view'
  | 'helpdesk:create'
  | 'helpdesk:comment'
  | 'helpdesk:manage'
  | 'helpdesk:inbox';

const EMPLOYEE_HELPDESK: readonly HelpDeskPermission[] = [
  'helpdesk:view',
  'helpdesk:create',
  'helpdesk:comment',
];

const ROLE_PERMISSIONS: Record<AppRole, readonly HelpDeskPermission[]> = {
  EMPLOYEE_PR: EMPLOYEE_HELPDESK,
  EMPLOYEE_CONT: EMPLOYEE_HELPDESK,
  MANAGER: EMPLOYEE_HELPDESK,
  FINANCE: EMPLOYEE_HELPDESK,
  HR: ['helpdesk:view', 'helpdesk:create', 'helpdesk:comment', 'helpdesk:manage', 'helpdesk:inbox'],
  ADMIN: ['helpdesk:view', 'helpdesk:create', 'helpdesk:comment', 'helpdesk:manage', 'helpdesk:inbox'],
  CEO: ['helpdesk:view', 'helpdesk:create', 'helpdesk:comment', 'helpdesk:manage', 'helpdesk:inbox'],
};

export function getHelpDeskPermissions(role: AppRole | null | undefined): HelpDeskPermission[] {
  if (!role) return [];
  return [...(ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.EMPLOYEE_PR)];
}

export function hasHelpDeskPermission(
  role: AppRole | null | undefined,
  permission: HelpDeskPermission,
) {
  return getHelpDeskPermissions(role).includes(permission);
}

/** Service Desk Admin → HR / Admin / CEO */
export function canManageHelpDesk(role: AppRole | null | undefined) {
  return hasHelpDeskPermission(role, 'helpdesk:manage');
}

export function canViewHelpDeskInbox(role: AppRole | null | undefined) {
  return hasHelpDeskPermission(role, 'helpdesk:inbox');
}
