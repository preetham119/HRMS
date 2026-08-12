import { APP_ROLES, type AppRole } from '@/lib/auth';
import { getLearningPermissions } from '@/lib/learning/permissions';
import { toAppraisalPersona } from '@/lib/appraisal/permissions';

export type RoleCatalogEntry = {
  role: AppRole;
  label: string;
  description: string;
  demoEmail: string;
  portalBrand: string;
  navModules: string[];
  appraisalPersona: string;
  learningPermissions: string[];
  canManageSettings: boolean;
  canAccessHrTools: boolean;
};

const ROLE_META: Record<
  AppRole,
  {
    label: string;
    description: string;
    demoEmail: string;
    portalBrand: string;
    navModules: string[];
  }
> = {
  EMPLOYEE: {
    label: 'Employee',
    description: 'Self-service: attendance, leave, payroll slips, documents, learning, and self-appraisal.',
    demoEmail: 'employee@company.com',
    portalBrand: 'Employee Portal',
    navModules: ['Dashboard', 'My Profile', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Documents', 'Learning', 'IT Service Desk', 'Settings', 'Newsletter', 'Exit Management'],
  },
  MANAGER: {
    label: 'Manager',
    description: 'Team reviews, trainer workspace, leave approvals path, and manager appraisal queue.',
    demoEmail: 'manager@company.com',
    portalBrand: 'Manager Portal',
    navModules: ['Dashboard', 'My Profile', 'Attendance', 'Leave', 'My Team', 'Payroll', 'Performance', 'Documents', 'Learning › Trainer', 'IT Service Desk', 'Settings', 'Newsletter', 'Exit Management'],
  },
  HR: {
    label: 'HR',
    description: 'People ops control: settings, cycles, employee attendance/leave, learning admin, service desk inbox.',
    demoEmail: 'hr@company.com',
    portalBrand: 'HR Portal',
    navModules: ['Dashboard', 'Employee Attendance', 'Employee Leave', 'Performance', 'Learning › HR Console', 'IT Service Desk › Inbox', 'Settings', 'Newsletter', 'Exit Management'],
  },
  FINANCE: {
    label: 'Finance',
    description: 'Finance-oriented staff portal with payroll visibility and exit full & final access patterns.',
    demoEmail: 'finance@company.com',
    portalBrand: 'Finance Portal',
    navModules: ['Dashboard', 'My Profile', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Documents', 'Settings', 'Newsletter', 'Exit › Full & Final'],
  },
  ADMIN: {
    label: 'Admin',
    description: 'System administration, documents, payroll, performance admin reviews, and settings access.',
    demoEmail: 'admin@company.com',
    portalBrand: 'Admin Portal',
    navModules: ['Dashboard', 'My Profile', 'Documents', 'Payroll', 'Performance', 'IT Service Desk', 'Settings', 'Newsletter'],
  },
  CEO: {
    label: 'CEO / Leadership',
    description: 'Executive portal: My Org, Finance, leadership appraisal approvals, and service desk oversight.',
    demoEmail: 'ceo@company.com',
    portalBrand: 'CEO Portal',
    navModules: ['Dashboard', 'My Profile', 'My Org', 'Finance', 'Performance', 'IT Service Desk', 'Newsletter'],
  },
};

/** Extract live role definitions from auth + module permission maps. */
export function getRolesCatalog(settingsAccessRoles: AppRole[] = ['HR', 'ADMIN']): RoleCatalogEntry[] {
  return APP_ROLES.map((role) => {
    const meta = ROLE_META[role];
    return {
      role,
      label: meta.label,
      description: meta.description,
      demoEmail: meta.demoEmail,
      portalBrand: meta.portalBrand,
      navModules: meta.navModules,
      appraisalPersona: toAppraisalPersona(role),
      learningPermissions: getLearningPermissions(role),
      canManageSettings: settingsAccessRoles.includes(role),
      canAccessHrTools: role === 'HR' || role === 'ADMIN' || role === 'CEO',
    };
  });
}

export function parseRolesList(value: string | undefined | null): AppRole[] {
  if (!value) return ['HR', 'ADMIN'];
  const parts = String(value)
    .split(/[,|]/)
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);
  const roles = parts.filter((part): part is AppRole => (APP_ROLES as string[]).includes(part));
  return roles.length ? roles : ['HR', 'ADMIN'];
}

export function getDefaultRoleOptions() {
  return APP_ROLES.map((role) => ({
    label: ROLE_META[role].label,
    value: role,
  }));
}
