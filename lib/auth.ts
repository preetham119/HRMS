export type AppRole =
  | 'EMPLOYEE_PR'
  | 'EMPLOYEE_CONT'
  | 'MANAGER'
  | 'HR'
  | 'FINANCE'
  | 'ADMIN'
  | 'CEO';

export const APP_ROLES: AppRole[] = [
  'EMPLOYEE_PR',
  'EMPLOYEE_CONT',
  'MANAGER',
  'HR',
  'FINANCE',
  'ADMIN',
  'CEO',
];

export const EMPLOYEE_ROLES: AppRole[] = ['EMPLOYEE_PR', 'EMPLOYEE_CONT'];

export const ROLE_LABELS: Record<AppRole, string> = {
  EMPLOYEE_PR: 'Employee-PR',
  EMPLOYEE_CONT: 'Employee-CONT',
  MANAGER: 'Manager',
  HR: 'HR',
  FINANCE: 'Finance',
  ADMIN: 'Admin',
  CEO: 'CEO',
};

export function isEmployeeRole(role: string | null | undefined): boolean {
  const value = (role ?? '').toUpperCase().replace(/-/g, '_');
  return value === 'EMPLOYEE_PR' || value === 'EMPLOYEE_CONT' || value === 'EMPLOYEE';
}

export function normalizeAppRole(role: string | undefined | null): AppRole {
  const value = (role ?? '').toUpperCase().replace(/-/g, '_');
  if (value === 'EMPLOYEE_PR' || value === 'EMPLOYEE') return 'EMPLOYEE_PR';
  if (value === 'EMPLOYEE_CONT') return 'EMPLOYEE_CONT';
  if (value === 'MANAGER') return 'MANAGER';
  if (value === 'HR') return 'HR';
  if (value === 'FINANCE') return 'FINANCE';
  if (value === 'ADMIN') return 'ADMIN';
  if (value === 'CEO') return 'CEO';
  return 'EMPLOYEE_PR';
}

export function getRoleLabel(role: string | null | undefined) {
  const normalized = normalizeAppRole(role);
  return ROLE_LABELS[normalized];
}

export interface JwtUserPayload {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  sub?: string;
  iat: number;
  exp: number;
}

export const AUTH_COOKIE_NAME = 'hrms-auth-session';

function encodeBase64(value: string) {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(value);
  }

  return Buffer.from(value, 'utf-8').toString('base64');
}

function decodeBase64(value: string) {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(value);
  }

  return Buffer.from(value, 'base64').toString('utf-8');
}

export function createJwtToken(user: Omit<JwtUserPayload, 'iat' | 'exp'>): string {
  const payload: JwtUserPayload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  };

  return encodeBase64(JSON.stringify(payload));
}

export function decodeJwtToken(token: string | null): JwtUserPayload | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeBase64(token);
    return JSON.parse(decoded) as JwtUserPayload;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string | null): AppRole | null {
  const payload = decodeJwtToken(token);
  return payload?.role ?? null;
}

export function isAuthorizedForRole(role: string | null | undefined, allowedRoles: AppRole[]) {
  if (!role) {
    return false;
  }

  const normalized = normalizeAppRole(role);
  return allowedRoles.includes(normalized);
}

export function setAuthCookie(token: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
