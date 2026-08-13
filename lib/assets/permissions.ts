import type { AppRole } from '@/lib/auth';
import { isEmployeeRole } from '@/lib/auth';

export function canManageAssets(role: AppRole | null | undefined) {
  return role === 'HR' || role === 'ADMIN';
}

export function canViewOrgAssets(role: AppRole | null | undefined) {
  return role === 'HR' || role === 'ADMIN' || role === 'CEO' || role === 'FINANCE';
}

export function canViewTeamAssets(role: AppRole | null | undefined) {
  return role === 'MANAGER' || canViewOrgAssets(role);
}

export function canViewOwnAssets(role: AppRole | null | undefined) {
  return Boolean(role);
}

export function isSelfOnlyAssetScope(role: AppRole | null | undefined) {
  return isEmployeeRole(role) || role === 'MANAGER' || role === 'FINANCE' || role === 'CEO';
}
