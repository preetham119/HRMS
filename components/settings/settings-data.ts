import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarClock,
  ClipboardList,
  Cpu,
  DatabaseBackup,
  FileStack,
  GitBranch,
  Info,
  Layers3,
  Network,
  Palette,
  Plug,
  ScrollText,
  Shield,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';

export type SettingsStatus = 'Configured' | 'Pending' | 'Disabled';

export type SettingsCategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: SettingsStatus;
  keywords: string[];
  accent: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal' | 'slate' | 'indigo';
};

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'org',
    slug: 'organization',
    title: 'Organization Settings',
    description: 'Company profile, legal entities, locations, and fiscal calendar.',
    icon: Building2,
    status: 'Configured',
    keywords: ['company', 'entity', 'location', 'org'],
    accent: 'sky',
  },
  {
    id: 'users',
    slug: 'user-roles',
    title: 'User & Role Management',
    description: 'Manage users, roles, permission matrices, and access scopes.',
    icon: UserCog,
    status: 'Configured',
    keywords: ['user', 'role', 'permission', 'rbac'],
    accent: 'indigo',
  },
  {
    id: 'departments',
    slug: 'departments-designations',
    title: 'Departments & Designations',
    description: 'Org units, designations, cost centers, and reporting lines.',
    icon: Network,
    status: 'Pending',
    keywords: ['department', 'designation', 'hierarchy'],
    accent: 'teal',
  },
  {
    id: 'employee',
    slug: 'employee-configuration',
    title: 'Employee Configuration',
    description: 'Employee fields, onboarding defaults, and profile policies.',
    icon: Users,
    status: 'Configured',
    keywords: ['employee', 'profile', 'fields'],
    accent: 'emerald',
  },
  {
    id: 'attendance',
    slug: 'attendance',
    title: 'Attendance Settings',
    description: 'Shifts, punch rules, regularization, and overtime policies.',
    icon: CalendarClock,
    status: 'Pending',
    keywords: ['attendance', 'shift', 'punch', 'overtime'],
    accent: 'sky',
  },
  {
    id: 'leave',
    slug: 'leave',
    title: 'Leave Management Settings',
    description: 'Leave types, accruals, holidays, and approval policies.',
    icon: ClipboardList,
    status: 'Configured',
    keywords: ['leave', 'holiday', 'accrual'],
    accent: 'violet',
  },
  {
    id: 'payroll',
    slug: 'payroll',
    title: 'Payroll Settings',
    description: 'Salary components, statutory rules, pay cycles, and banks.',
    icon: Wallet,
    status: 'Pending',
    keywords: ['payroll', 'salary', 'tax', 'pf', 'esi'],
    accent: 'emerald',
  },
  {
    id: 'recruitment',
    slug: 'recruitment',
    title: 'Recruitment Settings',
    description: 'Requisition templates, interview stages, and offer workflows.',
    icon: BadgeCheck,
    status: 'Disabled',
    keywords: ['recruitment', 'ats', 'hiring', 'offer'],
    accent: 'amber',
  },
  {
    id: 'performance',
    slug: 'performance',
    title: 'Performance Management',
    description: 'Review cycles, goal frameworks, ratings, and calibration.',
    icon: Sparkles,
    status: 'Pending',
    keywords: ['performance', 'okr', 'review', 'goals'],
    accent: 'violet',
  },
  {
    id: 'notifications',
    slug: 'notifications',
    title: 'Notifications & Email Templates',
    description: 'Channels, digests, and branded email/SMS templates.',
    icon: Bell,
    status: 'Configured',
    keywords: ['notification', 'email', 'template', 'sms'],
    accent: 'rose',
  },
  {
    id: 'workflow',
    slug: 'workflow',
    title: 'Workflow & Approval Configuration',
    description: 'Multi-level approvals, escalations, and routing rules.',
    icon: GitBranch,
    status: 'Configured',
    keywords: ['workflow', 'approval', 'routing'],
    accent: 'indigo',
  },
  {
    id: 'security',
    slug: 'security',
    title: 'Security & Authentication',
    description: 'SSO, MFA, password policy, session timeouts, and IP allowlists.',
    icon: Shield,
    status: 'Configured',
    keywords: ['security', 'sso', 'mfa', 'password'],
    accent: 'slate',
  },
  {
    id: 'audit',
    slug: 'audit-logs',
    title: 'Audit Logs',
    description: 'Immutable activity trails for compliance and investigations.',
    icon: ScrollText,
    status: 'Configured',
    keywords: ['audit', 'log', 'compliance'],
    accent: 'slate',
  },
  {
    id: 'integrations',
    slug: 'integrations',
    title: 'Integrations & APIs',
    description: 'Webhooks, API keys, and third-party connectors.',
    icon: Plug,
    status: 'Pending',
    keywords: ['integration', 'api', 'webhook'],
    accent: 'teal',
  },
  {
    id: 'documents',
    slug: 'documents',
    title: 'Document Management',
    description: 'Retention policies, categories, e-sign, and storage quotas.',
    icon: FileStack,
    status: 'Configured',
    keywords: ['document', 'storage', 'esign'],
    accent: 'sky',
  },
  {
    id: 'system',
    slug: 'system-preferences',
    title: 'System Preferences',
    description: 'Locale, timezone, number formats, and module switches.',
    icon: Layers3,
    status: 'Configured',
    keywords: ['system', 'locale', 'timezone'],
    accent: 'slate',
  },
  {
    id: 'backup',
    slug: 'backup-restore',
    title: 'Backup & Restore',
    description: 'Scheduled backups, restore points, and export archives.',
    icon: DatabaseBackup,
    status: 'Pending',
    keywords: ['backup', 'restore', 'archive'],
    accent: 'amber',
  },
  {
    id: 'ai',
    slug: 'ai-configuration',
    title: 'AI Configuration',
    description: 'Assistants, model access, data retention, and AI safety controls.',
    icon: Cpu,
    status: 'Disabled',
    keywords: ['ai', 'assistant', 'model'],
    accent: 'violet',
  },
  {
    id: 'branding',
    slug: 'branding-theme',
    title: 'Branding & Theme',
    description: 'Logo, brand colors, login wallpaper, and portal theming.',
    icon: Palette,
    status: 'Configured',
    keywords: ['branding', 'theme', 'logo', 'color'],
    accent: 'rose',
  },
  {
    id: 'about',
    slug: 'about',
    title: 'About & Version Information',
    description: 'Product version, license, build channel, and release notes.',
    icon: Info,
    status: 'Configured',
    keywords: ['about', 'version', 'license', 'release'],
    accent: 'slate',
  },
];

export type RecentChange = {
  id: string;
  module: string;
  action: string;
  actor: string;
  at: string;
};

export const RECENT_CHANGES: RecentChange[] = [
  {
    id: 'rc-1',
    module: 'Security & Authentication',
    action: 'Enabled MFA for admin roles',
    actor: 'HR Admin',
    at: 'Today · 10:42 AM',
  },
  {
    id: 'rc-2',
    module: 'Leave Management Settings',
    action: 'Updated sandwich rule for CL',
    actor: 'System Admin',
    at: 'Yesterday · 4:18 PM',
  },
  {
    id: 'rc-3',
    module: 'Notifications & Email Templates',
    action: 'Published payroll release template',
    actor: 'HR Admin',
    at: 'Jul 31 · 11:05 AM',
  },
  {
    id: 'rc-4',
    module: 'Workflow & Approval Configuration',
    action: 'Added manager escalation after 48h',
    actor: 'System Admin',
    at: 'Jul 30 · 2:27 PM',
  },
];

export const SETTINGS_META = {
  lastUpdated: 'Aug 3, 2026 · 3:05 PM IST',
  version: 'HRMS Portal v1.0.0',
  environment: 'Production',
  health: 'Healthy' as const,
};

export function getSettingsStats(categories: SettingsCategory[] = SETTINGS_CATEGORIES) {
  const configured = categories.filter((item) => item.status === 'Configured').length;
  const pending = categories.filter((item) => item.status === 'Pending').length;
  const disabled = categories.filter((item) => item.status === 'Disabled').length;
  return {
    total: categories.length,
    configured,
    pending,
    disabled,
  };
}

export function findSettingsCategory(slug: string) {
  return SETTINGS_CATEGORIES.find((item) => item.slug === slug) ?? null;
}
