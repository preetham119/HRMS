export type AppRole = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'FINANCE' | 'ADMIN' | 'CEO';

export const APP_ROLES: AppRole[] = ['EMPLOYEE', 'MANAGER', 'HR', 'FINANCE', 'ADMIN', 'CEO'];

export function normalizeAppRole(role: string | undefined | null): AppRole {
  const value = (role ?? '').toUpperCase();
  if (value === 'MANAGER') return 'MANAGER';
  if (value === 'HR') return 'HR';
  if (value === 'FINANCE') return 'FINANCE';
  if (value === 'ADMIN') return 'ADMIN';
  if (value === 'CEO') return 'CEO';
  return 'EMPLOYEE';
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

  return allowedRoles.includes(role.toUpperCase() as AppRole);
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
