import type { AppRole } from '@/lib/auth';
import { EMPLOYEE_ROLES } from '@/lib/auth';
import { canRoleAccessSettings, isPerformanceHubEnabled } from '@/lib/settings/registry';

export interface NavItem {
  href?: string;
  label: string;
  icon: string;
  roles: AppRole[];
  children?: NavItem[];
}

/** Roles that use the standard employee/HR navigation tree. */
const STAFF_ROLES: AppRole[] = [...EMPLOYEE_ROLES, 'MANAGER', 'HR', 'FINANCE'];

function exitManagementSection(roles: AppRole[]): NavItem {
  return {
    label: 'Exit Management',
    icon: 'DoorOpen',
    roles,
    children: [
      { href: '/exit/resignation', label: 'Resignation', icon: 'FilePenLine', roles },
      { href: '/exit/exit-interview', label: 'Exit Interview', icon: 'MessagesSquare', roles },
      { href: '/exit/full-final', label: 'Full & Final', icon: 'BadgeIndianRupee', roles },
    ],
  };
}

export const employeeMenu: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutGrid', roles: STAFF_ROLES },
  { href: '/profile', label: 'My Profile', icon: 'UserCircle2', roles: STAFF_ROLES },
  { href: '/attendance', label: 'Attendance', icon: 'CalendarRange', roles: STAFF_ROLES },
  { href: '/leave', label: 'Leave', icon: 'CalendarRange', roles: STAFF_ROLES },
  { href: '/my-team', label: 'My Team', icon: 'Users', roles: ['MANAGER'] },
  { href: '/payroll', label: 'Payroll', icon: 'Wallet2', roles: STAFF_ROLES },
  { href: '/performance', label: 'Performance', icon: 'Sparkles', roles: STAFF_ROLES },
  { href: '/documents', label: 'Documents', icon: 'FileText', roles: STAFF_ROLES },
  { href: '/assets', label: 'Asset Management', icon: 'Package', roles: STAFF_ROLES },
  {
    label: 'Learning',
    icon: 'GraduationCap',
    roles: STAFF_ROLES,
    children: [
      { href: '/learning', label: 'Overview', icon: 'LayoutGrid', roles: STAFF_ROLES },
      { href: '/learning/courses', label: 'Courses', icon: 'BookOpen', roles: STAFF_ROLES },
      { href: '/learning/quizzes', label: 'Quizzes', icon: 'ClipboardList', roles: STAFF_ROLES },
      { href: '/learning/assignments', label: 'Assignments', icon: 'FilePenLine', roles: STAFF_ROLES },
      // empL&D Trainer → Manager
      { href: '/learning/trainer', label: 'Trainer Workspace', icon: 'Users', roles: ['MANAGER'] },
      // empL&D Admin → HR
      { href: '/learning/admin', label: 'HR Console', icon: 'ShieldCheck', roles: ['HR'] },
    ],
  },
  {
    label: 'IT Service Desk',
    icon: 'HelpCircle',
    roles: STAFF_ROLES,
    children: [
      { href: '/help-desk', label: 'Overview', icon: 'LayoutGrid', roles: STAFF_ROLES },
      { href: '/help-desk/raise', label: 'Raise Request', icon: 'FilePenLine', roles: STAFF_ROLES },
      // Service Desk Admin → HR
      { href: '/help-desk/inbox', label: 'View all requests', icon: 'ShieldCheck', roles: ['HR'] },
    ],
  },
  { href: '/settings', label: 'Settings', icon: 'Settings', roles: STAFF_ROLES },
  { href: '/settings/team', label: 'Team', icon: 'Users', roles: ['HR', 'ADMIN'] },
  exitManagementSection(STAFF_ROLES),
  { href: '/newsletter', label: 'Newsletter', icon: 'MailPlus', roles: STAFF_ROLES },
];

export const hrMenuExtras: NavItem[] = [
  { href: '/employee-attendance', label: 'Employee Attendance', icon: 'ShieldCheck', roles: ['HR'] },
  { href: '/employee-leave', label: 'Employee Leave', icon: 'ShieldCheck', roles: ['HR'] },
];

/** CEO portal — curated left nav (same dedicated-menu model as HR). */
export const ceoMenu: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutGrid', roles: ['CEO'] },
  { href: '/profile', label: 'My Profile', icon: 'UserCircle2', roles: ['CEO'] },
  { href: '/my-org', label: 'My Org', icon: 'Building2', roles: ['CEO'] },
  { href: '/finance', label: 'Finance', icon: 'Wallet2', roles: ['CEO'] },
  { href: '/performance', label: 'Performance', icon: 'Sparkles', roles: ['CEO'] },
  exitManagementSection(['CEO']),
  { href: '/assets', label: 'Asset Management', icon: 'Package', roles: ['CEO'] },
  {
    label: 'IT Service Desk',
    icon: 'HelpCircle',
    roles: ['CEO'],
    children: [
      { href: '/help-desk', label: 'Overview', icon: 'LayoutGrid', roles: ['CEO'] },
      { href: '/help-desk/raise', label: 'Raise Request', icon: 'FilePenLine', roles: ['CEO'] },
      { href: '/help-desk/inbox', label: 'View all requests', icon: 'ShieldCheck', roles: ['CEO'] },
    ],
  },
  { href: '/newsletter', label: 'Newsletter', icon: 'MailPlus', roles: ['CEO'] },
  { href: '/settings/team', label: 'Team', icon: 'Users', roles: ['CEO'] },
];

/** Admin portal — curated left nav (same dedicated-menu model as HR / CEO). */
export const adminMenu: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutGrid', roles: ['ADMIN'] },
  { href: '/profile', label: 'My Profile', icon: 'UserCircle2', roles: ['ADMIN'] },
  { href: '/documents', label: 'Documents', icon: 'FileText', roles: ['ADMIN'] },
  { href: '/assets', label: 'Asset Management', icon: 'Package', roles: ['ADMIN'] },
  { href: '/payroll', label: 'Payroll', icon: 'Wallet2', roles: ['ADMIN'] },
  { href: '/performance', label: 'Performance', icon: 'Sparkles', roles: ['ADMIN'] },
  exitManagementSection(['ADMIN']),
  { href: '/settings', label: 'Settings', icon: 'Settings', roles: ['ADMIN'] },
  { href: '/settings/team', label: 'Team', icon: 'Users', roles: ['ADMIN'] },
  {
    label: 'IT Service Desk',
    icon: 'HelpCircle',
    roles: ['ADMIN'],
    children: [
      { href: '/help-desk', label: 'Overview', icon: 'LayoutGrid', roles: ['ADMIN'] },
      { href: '/help-desk/raise', label: 'Raise Request', icon: 'FilePenLine', roles: ['ADMIN'] },
      { href: '/help-desk/inbox', label: 'View all requests', icon: 'ShieldCheck', roles: ['ADMIN'] },
    ],
  },
  { href: '/newsletter', label: 'Newsletter', icon: 'MailPlus', roles: ['ADMIN'] },
];

/** @deprecated Use getMenuForRole — kept for compatibility */
export const hrMenu: NavItem[] = [...employeeMenu, ...hrMenuExtras];

function filterMenu(items: NavItem[], role: AppRole): NavItem[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children ? filterMenu(item.children, role) : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0 || Boolean(item.href));
}

export function getMenuForRole(role: AppRole | null | undefined) {
  const resolved: AppRole = role ?? 'EMPLOYEE_PR';

  // Dedicated CEO navigation — mirrors HR's role-specific menu composition.
  if (resolved === 'CEO') {
    return applySettingsVisibility(filterMenu(ceoMenu, resolved), resolved);
  }

  // Dedicated Admin navigation — curated portal, same model as CEO / HR.
  if (resolved === 'ADMIN') {
    return applySettingsVisibility(filterMenu(adminMenu, resolved), resolved);
  }

  const base = filterMenu(employeeMenu, resolved);

  // Keep Exit Management + Newsletter as the final items for HR.
  if (resolved === 'HR') {
    const trailingLabels = new Set(['Exit Management', 'Newsletter']);
    const primary = base.filter((item) => !trailingLabels.has(item.label));
    const trailing = base.filter((item) => trailingLabels.has(item.label));
    return applySettingsVisibility(
      [...primary, ...filterMenu(hrMenuExtras, resolved), ...trailing],
      resolved,
    );
  }

  return applySettingsVisibility(base, resolved);
}

function applySettingsVisibility(items: NavItem[], role: AppRole): NavItem[] {
  let next = items;

  if (!canRoleAccessSettings(role)) {
    next = next.filter((item) => item.href !== '/settings' && item.label !== 'Settings');
  }
  if (!isPerformanceHubEnabled() && role !== 'HR' && role !== 'ADMIN' && role !== 'CEO') {
    next = next.filter((item) => item.href !== '/performance' && item.label !== 'Performance');
  }

  return next;
}

export function isHrRole(role: AppRole | null | undefined) {
  return role === 'HR' || role === 'ADMIN';
}

export function isCeoRole(role: AppRole | null | undefined) {
  return role === 'CEO';
}

export function isAdminRole(role: AppRole | null | undefined) {
  return role === 'ADMIN';
}

/** Centralized portal subtitle branding by role — extend here for new roles. */
export const PORTAL_BRAND_BY_ROLE: Record<AppRole, string> = {
  EMPLOYEE_PR: 'Employee-PR Portal',
  EMPLOYEE_CONT: 'Employee-CONT Portal',
  MANAGER: 'Manager Portal',
  HR: 'HR Portal',
  ADMIN: 'Admin Portal',
  FINANCE: 'Finance Portal',
  CEO: 'CEO Portal',
};

export function getPortalBrandLabel(role: AppRole | null | undefined) {
  const resolved: AppRole = role ?? 'EMPLOYEE_PR';
  return PORTAL_BRAND_BY_ROLE[resolved] ?? PORTAL_BRAND_BY_ROLE.EMPLOYEE_PR;
}
