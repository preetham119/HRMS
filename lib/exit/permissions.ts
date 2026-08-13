import type { AppRole } from '@/lib/auth';
import { isEmployeeRole } from '@/lib/auth';
import type { ExitCase, ExitStage, StageAccess } from '@/lib/exit/types';

export function isApproverRole(role: AppRole | null | undefined) {
  return role === 'MANAGER' || role === 'HR' || role === 'ADMIN';
}

export function isHrOrAdmin(role: AppRole | null | undefined) {
  return role === 'HR' || role === 'ADMIN';
}

export function isFinanceRole(role: AppRole | null | undefined) {
  return role === 'FINANCE' || role === 'ADMIN' || role === 'HR';
}

export function canViewExitModule(role: AppRole | null | undefined) {
  return Boolean(role);
}

export function canSubmitResignation(role: AppRole | null | undefined) {
  return isEmployeeRole(role) || role === 'MANAGER' || role === 'ADMIN';
}

export function canApproveAsManager(role: AppRole | null | undefined, exitCase: ExitCase | null, actorEmail?: string) {
  if (!exitCase || role !== 'MANAGER') return false;
  if (exitCase.status !== 'Pending Approval' && exitCase.status !== 'Submitted') return false;
  if (exitCase.managerApproval.status !== 'Pending') return false;
  if (exitCase.withdrawalRequest?.status === 'Pending') return false;
  return exitCase.reportingManagerEmail.toLowerCase() === (actorEmail ?? '').toLowerCase();
}

export function canApproveAsHr(role: AppRole | null | undefined, exitCase: ExitCase | null) {
  if (!exitCase || !isHrOrAdmin(role)) return false;
  if (exitCase.status !== 'Pending Approval' && exitCase.status !== 'Submitted') return false;
  if (exitCase.hrApproval.status !== 'Pending') return false;
  if (exitCase.withdrawalRequest?.status === 'Pending') return false;
  return true;
}

export function canRequestWithdrawal(role: AppRole | null | undefined, exitCase: ExitCase | null, actorEmployeeId?: string) {
  if (!exitCase || !isEmployeeRole(role)) return false;
  if (exitCase.employeeId !== actorEmployeeId) return false;
  if (exitCase.withdrawalRequest?.status === 'Pending') return false;
  const beforeFinalApproval = exitCase.status === 'Pending Approval' || exitCase.status === 'Submitted';
  const bothApproved = exitCase.managerApproval.status === 'Approved' && exitCase.hrApproval.status === 'Approved';
  return beforeFinalApproval && !bothApproved;
}

export function canReviewWithdrawal(role: AppRole | null | undefined, exitCase: ExitCase | null) {
  if (!exitCase || !isHrOrAdmin(role)) return false;
  return exitCase.withdrawalRequest?.status === 'Pending';
}

export function canReopenResignation(role: AppRole | null | undefined, exitCase: ExitCase | null) {
  if (!exitCase || !isHrOrAdmin(role)) return false;
  return exitCase.status === 'Rejected' || exitCase.status === 'Revoked' || exitCase.status === 'Cancelled';
}

export function canCompleteExitInterview(role: AppRole | null | undefined, exitCase: ExitCase | null, actorEmployeeId?: string) {
  if (!exitCase) return false;
  if (getStageAccess(exitCase).exitInterview !== 'enabled') return false;
  if (isHrOrAdmin(role)) return true;
  return isEmployeeRole(role) && exitCase.employeeId === actorEmployeeId;
}

export function canProcessFullAndFinal(role: AppRole | null | undefined, exitCase: ExitCase | null) {
  if (!exitCase) return false;
  if (getStageAccess(exitCase).fullAndFinal !== 'enabled') return false;
  return isFinanceRole(role);
}

export function getStageAccess(exitCase: ExitCase | null): Record<ExitStage, StageAccess> {
  if (!exitCase) {
    return {
      resignation: 'enabled',
      exitInterview: 'locked',
      fullAndFinal: 'locked',
    };
  }

  if (exitCase.status === 'Revoked' || exitCase.status === 'Cancelled') {
    return {
      resignation: 'completed',
      exitInterview: 'locked',
      fullAndFinal: 'locked',
    };
  }

  if (exitCase.status === 'Rejected') {
    return {
      resignation: 'completed',
      exitInterview: 'locked',
      fullAndFinal: 'locked',
    };
  }

  if (exitCase.status === 'Completed') {
    return {
      resignation: 'completed',
      exitInterview: 'completed',
      fullAndFinal: 'completed',
    };
  }

  if (exitCase.status === 'Full & Final Pending' || exitCase.status === 'Exit Interview Completed') {
    return {
      resignation: 'completed',
      exitInterview: 'completed',
      fullAndFinal: 'enabled',
    };
  }

  if (exitCase.status === 'Exit Interview Pending' || exitCase.status === 'Approved') {
    return {
      resignation: 'completed',
      exitInterview: 'enabled',
      fullAndFinal: 'locked',
    };
  }

  if (
    exitCase.status === 'Draft' ||
    (exitCase.status === 'Pending Approval' && !exitCase.formLocked && exitCase.version > 1)
  ) {
    return {
      resignation: 'enabled',
      exitInterview: 'locked',
      fullAndFinal: 'locked',
    };
  }

  // Submitted / Pending Approval / locked form
  if (exitCase.status === 'Submitted' || exitCase.status === 'Pending Approval' || exitCase.formLocked) {
    return {
      resignation: exitCase.formLocked ? 'completed' : 'enabled',
      exitInterview: 'locked',
      fullAndFinal: 'locked',
    };
  }

  return {
    resignation: 'enabled',
    exitInterview: 'locked',
    fullAndFinal: 'locked',
  };
}

export function getTimelineSteps(exitCase: ExitCase | null) {
  const access = getStageAccess(exitCase);
  const status = exitCase?.status;

  return [
    {
      key: 'resignation' as const,
      label: 'Resignation',
      description: 'Submit resignation letter and details',
      state: access.resignation === 'completed' || status === 'Pending Approval' || status === 'Submitted'
        ? status === 'Rejected' || status === 'Revoked'
          ? 'error'
          : 'done'
        : access.resignation === 'enabled'
          ? 'current'
          : 'upcoming',
    },
    {
      key: 'approvals' as const,
      label: 'Approvals',
      description: 'Manager and HR approval',
      state:
        status === 'Rejected'
          ? 'error'
          : status === 'Approved' ||
              status === 'Exit Interview Pending' ||
              status === 'Exit Interview Completed' ||
              status === 'Full & Final Pending' ||
              status === 'Completed'
            ? 'done'
            : status === 'Pending Approval' || status === 'Submitted'
              ? 'current'
              : 'upcoming',
    },
    {
      key: 'exitInterview' as const,
      label: 'Exit Interview',
      description: 'Share feedback with HR',
      state:
        access.exitInterview === 'completed'
          ? 'done'
          : access.exitInterview === 'enabled'
            ? 'current'
            : status === 'Revoked' || status === 'Cancelled'
              ? 'locked'
              : 'upcoming',
    },
    {
      key: 'fullAndFinal' as const,
      label: 'Full & Final',
      description: 'Settlement and clearance',
      state:
        access.fullAndFinal === 'completed'
          ? 'done'
          : access.fullAndFinal === 'enabled'
            ? 'current'
            : status === 'Revoked' || status === 'Cancelled'
              ? 'locked'
              : 'upcoming',
    },
  ];
}
