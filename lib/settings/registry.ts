import { APP_ROLES, type AppRole } from '@/lib/auth';
import { SETTINGS_MODULE_CONFIGS } from '@/components/settings/settings-fields';
import { HRMS_SETTINGS_STORAGE_KEY } from '@/lib/settings/constants';
import { parseRolesList } from '@/lib/settings/roles-catalog';

type SettingsValues = Record<string, string | number | boolean>;

function defaultsFor(slug: string): SettingsValues {
  return { ...(SETTINGS_MODULE_CONFIGS[slug]?.defaults ?? {}) };
}

function readStoreValues(slug: string): SettingsValues {
  const base = defaultsFor(slug);
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(HRMS_SETTINGS_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as { valuesBySlug?: Record<string, SettingsValues> };
    return { ...base, ...(parsed.valuesBySlug?.[slug] ?? {}) };
  } catch {
    return base;
  }
}

export function getSettingsValues(slug: string): SettingsValues {
  return readStoreValues(slug);
}

export function getOrganizationSettings() {
  const v = getSettingsValues('organization');
  return {
    companyName: String(v.companyName || 'DesIDEA Technologies'),
    legalEntity: String(v.legalEntity || ''),
    headquarters: String(v.headquarters || ''),
    fiscalYearStart: String(v.fiscalYearStart || 'April'),
    timezone: String(v.timezone || 'Asia/Kolkata'),
    currency: String(v.currency || 'INR'),
  };
}

export function getUserRolesSettings() {
  const v = getSettingsValues('user-roles');
  const defaultRoleRaw = String(v.defaultRole || 'EMPLOYEE_PR').toUpperCase().replace(/-/g, '_');
  const normalizedDefault = defaultRoleRaw === 'EMPLOYEE' ? 'EMPLOYEE_PR' : defaultRoleRaw;
  const defaultRole = (APP_ROLES as string[]).includes(normalizedDefault)
    ? (normalizedDefault as AppRole)
    : 'EMPLOYEE_PR';
  return {
    defaultRole,
    allowSelfSignup: Boolean(v.allowSelfSignup),
    requireManagerAssignment: Boolean(v.requireManagerAssignment),
    sessionIdleMinutes: Number(v.sessionIdleMinutes) || 30,
    permissionAudit: Boolean(v.permissionAudit),
    settingsAccessRoles: parseRolesList(String(v.settingsAccessRoles || 'HR,ADMIN')),
  };
}

export function getLeaveSettings() {
  const v = getSettingsValues('leave');
  return {
    annualLeaveDays: Number(v.annualLeaveDays) || 18,
    casualLeaveDays: Number(v.casualLeaveDays) || 12,
    sickLeaveDays: Number(v.sickLeaveDays) || 8,
    sandwichRule: Boolean(v.sandwichRule),
    carryForwardMax: Number(v.carryForwardMax) || 5,
    approvalLevels: String(v.approvalLevels || 'manager') as 'manager' | 'manager_hr' | 'manager_hr_admin',
  };
}

export function getAttendanceSettings() {
  const v = getSettingsValues('attendance');
  return {
    shiftStart: String(v.shiftStart || '09:30'),
    graceMinutes: Number(v.graceMinutes) || 15,
    halfDayThresholdHours: Number(v.halfDayThresholdHours) || 4,
    overtimeEnabled: Boolean(v.overtimeEnabled),
    geoFencing: Boolean(v.geoFencing),
  };
}

export function getPerformanceSettings() {
  const v = getSettingsValues('performance');
  const goalWeight = Number(v.goalWeight);
  const competencyWeight = Number(v.competencyWeight);
  return {
    cycleFrequency: String(v.cycleFrequency || 'semi_annual'),
    ratingScale: String(v.ratingScale || '5_star'),
    goalWeight: Number.isFinite(goalWeight) ? goalWeight : 60,
    competencyWeight: Number.isFinite(competencyWeight) ? competencyWeight : 40,
    workflow: String(v.workflow || 'self_manager_admin_leadership'),
    calibrationRequired: Boolean(v.calibrationRequired),
    openPerformanceHub: v.openPerformanceHub !== false,
  };
}

export function getDocumentsSettings() {
  const v = getSettingsValues('documents');
  const maxUploadMb = Number(v.maxUploadMb);
  const allowedTypes = String(v.allowedTypes || 'pdf,docx,png,jpg')
    .split(',')
    .map((item) => item.trim().toLowerCase().replace(/^\./, ''))
    .filter(Boolean);
  return {
    retentionYears: Number(v.retentionYears) || 7,
    esignEnabled: v.esignEnabled !== false,
    maxUploadMb: Number.isFinite(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb : 10,
    allowedTypes: allowedTypes.length ? allowedTypes : ['pdf', 'docx', 'png', 'jpg'],
  };
}

export function getBrandingSettings() {
  const v = getSettingsValues('branding-theme');
  return {
    portalName: String(v.portalName || 'HRMS Portal'),
    primaryColor: String(v.primaryColor || '#1565C0'),
    loginTagline: String(v.loginTagline || 'People operations, unified.'),
    showLogoOnEmails: v.showLogoOnEmails !== false,
  };
}

export function getSystemPreferences() {
  const v = getSettingsValues('system-preferences');
  return {
    dateFormat: String(v.dateFormat || 'DD MMM YYYY'),
    numberFormat: String(v.numberFormat || 'en-IN'),
    weekStartsOn: String(v.weekStartsOn || 'monday'),
    maintenanceMode: Boolean(v.maintenanceMode),
    darkModeDefault: Boolean(v.darkModeDefault),
  };
}

export function getPayrollSettings() {
  const v = getSettingsValues('payroll');
  return {
    payCycle: String(v.payCycle || 'monthly'),
    payDay: Number(v.payDay) || 28,
    pfEnabled: v.pfEnabled !== false,
    esiEnabled: v.esiEnabled !== false,
    bankExportFormat: String(v.bankExportFormat || 'neft'),
  };
}

export function getNotificationsSettings() {
  const v = getSettingsValues('notifications');
  return {
    emailEnabled: v.emailEnabled !== false,
    smsEnabled: Boolean(v.smsEnabled),
    digestFrequency: String(v.digestFrequency || 'daily'),
    fromName: String(v.fromName || 'HRMS Portal'),
    replyTo: String(v.replyTo || 'hr@company.com'),
  };
}

export function canRoleAccessSettings(role: AppRole | null | undefined) {
  if (!role) return false;
  return getUserRolesSettings().settingsAccessRoles.includes(role);
}

export function isPerformanceHubEnabled() {
  return getPerformanceSettings().openPerformanceHub;
}
