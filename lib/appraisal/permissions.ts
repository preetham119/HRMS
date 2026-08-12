import type { AppRole } from '@/lib/auth';
import type { AppraisalStatus } from '@/lib/appraisal/types';

/** Map HRMS roles → appraisal personas. Leadership = CEO. */
export function toAppraisalPersona(role: AppRole | null | undefined) {
  switch (role) {
    case 'MANAGER':
      return 'manager' as const;
    case 'HR':
      return 'hr' as const;
    case 'ADMIN':
      return 'admin' as const;
    case 'CEO':
      return 'leadership' as const;
    case 'FINANCE':
    case 'EMPLOYEE':
    default:
      return 'employee' as const;
  }
}

export function canManageCycles(role: AppRole | null | undefined) {
  return role === 'HR';
}

export function canReviewAsManager(role: AppRole | null | undefined) {
  return role === 'MANAGER';
}

export function canReviewAsAdmin(role: AppRole | null | undefined) {
  return role === 'ADMIN';
}

export function canReviewAsLeadership(role: AppRole | null | undefined) {
  return role === 'CEO';
}

export function canEditSelfAppraisal(status: AppraisalStatus) {
  return status === 'draft' || status === 'returned';
}

export function statusLabel(status: AppraisalStatus | string) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'returned':
      return 'Returned';
    case 'under_manager_review':
      return 'Manager Review';
    case 'under_admin_review':
      return 'Admin Review';
    case 'under_leadership_review':
      return 'Leadership Review';
    case 'completed':
      return 'Completed';
    default:
      return String(status);
  }
}
