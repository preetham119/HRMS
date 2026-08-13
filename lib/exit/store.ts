import type { AppRole } from '@/lib/auth';
import { isEmployeeRole } from '@/lib/auth';
import type {
  AuditLogEntry,
  ExitActor,
  ExitCase,
  ExitNotification,
  ExitStatus,
  ExitVersionSnapshot,
} from '@/lib/exit/types';

const globalForExit = globalThis as unknown as {
  __hrmsExitCases?: ExitCase[];
  __hrmsExitNotifications?: ExitNotification[];
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function createAudit(
  actor: ExitActor,
  action: string,
  details: string,
): AuditLogEntry {
  return {
    id: uid('aud'),
    action,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    details,
    timestamp: nowIso(),
  };
}

function pushNotification(input: Omit<ExitNotification, 'id' | 'read' | 'createdAt'> & { read?: boolean }) {
  const list = getNotificationsStore();
  list.unshift({
    id: uid('ntf'),
    read: input.read ?? false,
    createdAt: nowIso(),
    userId: input.userId,
    role: input.role,
    title: input.title,
    message: input.message,
    relatedExitId: input.relatedExitId,
  });
}

export function getExitCasesStore(): ExitCase[] {
  if (!globalForExit.__hrmsExitCases) {
    globalForExit.__hrmsExitCases = [];
  }
  return globalForExit.__hrmsExitCases;
}

export function getNotificationsStore(): ExitNotification[] {
  if (!globalForExit.__hrmsExitNotifications) {
    globalForExit.__hrmsExitNotifications = [];
  }
  return globalForExit.__hrmsExitNotifications;
}

export function findExitById(id: string) {
  return getExitCasesStore().find((item) => item.id === id) ?? null;
}

export function findActiveExitForEmployee(employeeId: string) {
  const cases = getExitCasesStore()
    .filter((item) => item.employeeId === employeeId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    cases.find(
      (item) =>
        !['Completed', 'Cancelled'].includes(item.status) ||
        item.status === 'Revoked' ||
        item.status === 'Rejected',
    ) ??
    cases[0] ??
    null
  );
}

export function listExitsForActor(actor: ExitActor): ExitCase[] {
  const all = getExitCasesStore().slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (actor.role === 'HR' || actor.role === 'ADMIN' || actor.role === 'FINANCE') {
    return all;
  }

  if (actor.role === 'MANAGER') {
    return all.filter(
      (item) =>
        item.reportingManagerEmail.toLowerCase() === actor.email.toLowerCase() ||
        item.employeeId === actor.employeeId,
    );
  }

  return all.filter((item) => item.employeeId === actor.employeeId);
}

function bothApproved(exitCase: ExitCase) {
  return exitCase.managerApproval.status === 'Approved' && exitCase.hrApproval.status === 'Approved';
}

function advanceAfterApprovals(exitCase: ExitCase, actor: ExitActor) {
  if (!bothApproved(exitCase)) return;
  exitCase.status = 'Approved';
  exitCase.auditLogs.unshift(createAudit(actor, 'RESIGNATION_APPROVED', 'Manager and HR approvals completed.'));
  exitCase.status = 'Exit Interview Pending';
  exitCase.exitInterview = exitCase.exitInterview ?? {
    completed: false,
    primaryReason: '',
    experienceRating: 0,
    managerRating: 0,
    wouldRecommend: '',
    likedMost: '',
    improvements: '',
    additionalComments: '',
  };
  exitCase.auditLogs.unshift(
    createAudit(actor, 'EXIT_INTERVIEW_ENABLED', 'Exit Interview stage has been enabled automatically.'),
  );
  pushNotification({
    userId: exitCase.employeeId,
    title: 'Exit Interview unlocked',
    message: 'Your resignation is approved. Please complete the Exit Interview.',
    relatedExitId: exitCase.id,
  });
}

export function createOrUpdateDraft(
  actor: ExitActor,
  payload: {
    resignationDate: string;
    lastWorkingDay: string;
    noticePeriodDays: number;
    reasonCategory: string;
    reasonDetails: string;
    letterFileName?: string;
    letterFileSize?: number;
    letterMimeType?: string;
    letterDataUrl?: string;
    designation?: string;
    department?: string;
    reportingManagerEmail?: string;
    reportingManagerId?: string;
  },
  submit: boolean,
): ExitCase {
  let exitCase = findActiveExitForEmployee(actor.employeeId);

  if (exitCase && exitCase.formLocked) {
    throw new Error('Resignation form is locked and cannot be modified.');
  }

  const canEdit =
    !exitCase ||
    exitCase.status === 'Draft' ||
    ((exitCase.status === 'Rejected' || exitCase.status === 'Revoked') && !exitCase.formLocked);

  if (!exitCase || ['Completed', 'Cancelled'].includes(exitCase.status)) {
    exitCase = {
      id: uid('exit'),
      version: 1,
      employeeId: actor.employeeId,
      employeeName: actor.name,
      employeeEmail: actor.email,
      department: payload.department ?? 'Quality Assurance',
      designation: payload.designation ?? 'Employee',
      reportingManagerId: payload.reportingManagerId ?? 'usr-mgr-001',
      reportingManagerEmail: payload.reportingManagerEmail ?? 'manager@company.com',
      status: 'Draft',
      resignationDate: payload.resignationDate,
      lastWorkingDay: payload.lastWorkingDay,
      noticePeriodDays: payload.noticePeriodDays,
      reasonCategory: payload.reasonCategory,
      reasonDetails: payload.reasonDetails,
      letterFileName: payload.letterFileName,
      letterFileSize: payload.letterFileSize,
      letterMimeType: payload.letterMimeType,
      letterDataUrl: payload.letterDataUrl,
      managerApproval: { status: 'Pending' },
      hrApproval: { status: 'Pending' },
      withdrawalRequest: null,
      exitInterview: null,
      fullAndFinal: null,
      versions: [],
      auditLogs: [createAudit(actor, 'DRAFT_CREATED', 'Resignation draft created.')],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      formLocked: false,
    };
    getExitCasesStore().unshift(exitCase);
  } else {
    if (!canEdit && exitCase.status !== 'Draft') {
      throw new Error('You cannot edit this resignation in the current status.');
    }
    exitCase.resignationDate = payload.resignationDate;
    exitCase.lastWorkingDay = payload.lastWorkingDay;
    exitCase.noticePeriodDays = payload.noticePeriodDays;
    exitCase.reasonCategory = payload.reasonCategory;
    exitCase.reasonDetails = payload.reasonDetails;
    if (payload.letterFileName) {
      exitCase.letterFileName = payload.letterFileName;
      exitCase.letterFileSize = payload.letterFileSize;
      exitCase.letterMimeType = payload.letterMimeType;
      exitCase.letterDataUrl = payload.letterDataUrl;
    }
    exitCase.updatedAt = nowIso();
    exitCase.auditLogs.unshift(createAudit(actor, 'DRAFT_UPDATED', 'Resignation draft updated.'));
  }

  if (submit) {
    if (!exitCase.letterFileName) {
      throw new Error('Please upload a resignation letter before submitting.');
    }
    exitCase.status = 'Pending Approval';
    exitCase.formLocked = true;
    exitCase.managerApproval = { status: 'Pending' };
    exitCase.hrApproval = { status: 'Pending' };
    exitCase.withdrawalRequest = null;
    exitCase.updatedAt = nowIso();
    exitCase.auditLogs.unshift(
      createAudit(actor, 'RESIGNATION_SUBMITTED', 'Resignation submitted. Status set to Pending Approval.'),
    );
    pushNotification({
      userId: exitCase.reportingManagerId,
      role: 'MANAGER',
      title: 'Resignation pending approval',
      message: `${exitCase.employeeName} submitted a resignation request. Please review and approve.`,
      relatedExitId: exitCase.id,
    });
    pushNotification({
      userId: 'usr-hr-001',
      role: 'HR',
      title: 'Resignation pending approval',
      message: `${exitCase.employeeName} submitted a resignation request. Please review and approve.`,
      relatedExitId: exitCase.id,
    });
  }

  return exitCase;
}

export function decideApproval(
  actor: ExitActor,
  exitId: string,
  asRole: 'MANAGER' | 'HR',
  decision: 'Approved' | 'Rejected',
  comment?: string,
): ExitCase {
  const exitCase = findExitById(exitId);
  if (!exitCase) throw new Error('Exit case not found.');
  if (exitCase.withdrawalRequest?.status === 'Pending') {
    throw new Error('Resolve the pending withdrawal request before approving.');
  }
  if (!['Pending Approval', 'Submitted'].includes(exitCase.status)) {
    throw new Error('Resignation is not awaiting approval.');
  }

  const target = asRole === 'MANAGER' ? exitCase.managerApproval : exitCase.hrApproval;
  if (target.status !== 'Pending') {
    throw new Error(`${asRole} decision already recorded.`);
  }

  if (asRole === 'MANAGER' && exitCase.reportingManagerEmail.toLowerCase() !== actor.email.toLowerCase()) {
    if (actor.role !== 'ADMIN') {
      throw new Error('Only the reporting manager can approve this resignation.');
    }
  }

  Object.assign(target, {
    status: decision,
    actedBy: actor.id,
    actedByName: actor.name,
    comment: comment ?? '',
    actedAt: nowIso(),
  });

  exitCase.updatedAt = nowIso();
  exitCase.auditLogs.unshift(
    createAudit(actor, `${asRole}_DECISION`, `${asRole} ${decision.toLowerCase()} the resignation.`),
  );

  if (decision === 'Rejected') {
    exitCase.status = 'Rejected';
    exitCase.formLocked = true;
    pushNotification({
      userId: exitCase.employeeId,
      title: 'Resignation rejected',
      message: `Your resignation was rejected by ${asRole}. ${comment ?? ''}`.trim(),
      relatedExitId: exitCase.id,
    });
    return exitCase;
  }

  advanceAfterApprovals(exitCase, actor);
  if (exitCase.status === 'Pending Approval' || exitCase.status === 'Submitted') {
    exitCase.status = 'Pending Approval';
    // Keep the other approver notified while waiting on the second approval
    if (asRole === 'MANAGER' && exitCase.hrApproval.status === 'Pending') {
      pushNotification({
        userId: 'usr-hr-001',
        role: 'HR',
        title: 'Manager approved — HR action needed',
        message: `Manager approved ${exitCase.employeeName}'s resignation. Please complete HR approval.`,
        relatedExitId: exitCase.id,
      });
    }
    if (asRole === 'HR' && exitCase.managerApproval.status === 'Pending') {
      pushNotification({
        userId: exitCase.reportingManagerId,
        role: 'MANAGER',
        title: 'HR approved — Manager action needed',
        message: `HR approved ${exitCase.employeeName}'s resignation. Please complete Manager approval.`,
        relatedExitId: exitCase.id,
      });
    }
  }
  return exitCase;
}

export function requestWithdrawal(actor: ExitActor, exitId: string, reason: string): ExitCase {
  const exitCase = findExitById(exitId);
  if (!exitCase) throw new Error('Exit case not found.');
  if (exitCase.employeeId !== actor.employeeId) throw new Error('You can only withdraw your own resignation.');
  if (bothApproved(exitCase)) throw new Error('Withdrawal is not allowed after final approval.');
  if (!['Pending Approval', 'Submitted'].includes(exitCase.status)) {
    throw new Error('Withdrawal can only be requested before final approval.');
  }
  if (exitCase.withdrawalRequest?.status === 'Pending') {
    throw new Error('A withdrawal request is already pending.');
  }

  exitCase.withdrawalRequest = {
    id: uid('wd'),
    reason,
    status: 'Pending',
    requestedAt: nowIso(),
    requestedBy: actor.id,
    requestedByName: actor.name,
  };
  exitCase.updatedAt = nowIso();
  exitCase.auditLogs.unshift(createAudit(actor, 'WITHDRAWAL_REQUESTED', 'Employee requested resignation withdrawal.'));
  pushNotification({
    userId: 'usr-hr-001',
    role: 'HR',
    title: 'Withdrawal request pending',
    message: `${exitCase.employeeName} requested to withdraw resignation.`,
    relatedExitId: exitCase.id,
  });
  return exitCase;
}

export function reviewWithdrawal(
  actor: ExitActor,
  exitId: string,
  decision: 'Approved' | 'Rejected',
  comment?: string,
): ExitCase {
  const exitCase = findExitById(exitId);
  if (!exitCase) throw new Error('Exit case not found.');
  if (!exitCase.withdrawalRequest || exitCase.withdrawalRequest.status !== 'Pending') {
    throw new Error('No pending withdrawal request.');
  }

  exitCase.withdrawalRequest.status = decision;
  exitCase.withdrawalRequest.reviewedBy = actor.id;
  exitCase.withdrawalRequest.reviewedByName = actor.name;
  exitCase.withdrawalRequest.reviewedAt = nowIso();
  exitCase.withdrawalRequest.reviewComment = comment ?? '';
  exitCase.updatedAt = nowIso();

  if (decision === 'Approved') {
    exitCase.status = 'Revoked';
    exitCase.formLocked = true;
    exitCase.exitInterview = null;
    exitCase.fullAndFinal = null;
    exitCase.auditLogs.unshift(
      createAudit(actor, 'WITHDRAWAL_APPROVED', 'Withdrawal approved. Exit Interview and Full & Final disabled.'),
    );
    pushNotification({
      userId: exitCase.employeeId,
      title: 'Resignation revoked',
      message: 'Your withdrawal request was approved. The exit workflow has been revoked.',
      relatedExitId: exitCase.id,
    });
  } else {
    exitCase.auditLogs.unshift(createAudit(actor, 'WITHDRAWAL_REJECTED', 'Withdrawal request rejected.'));
    pushNotification({
      userId: exitCase.employeeId,
      title: 'Withdrawal rejected',
      message: 'Your withdrawal request was rejected. The resignation workflow continues.',
      relatedExitId: exitCase.id,
    });
  }

  return exitCase;
}

export function reopenResignation(actor: ExitActor, exitId: string, reason?: string): ExitCase {
  const exitCase = findExitById(exitId);
  if (!exitCase) throw new Error('Exit case not found.');
  if (!['Rejected', 'Revoked', 'Cancelled'].includes(exitCase.status)) {
    throw new Error('Only rejected, revoked, or cancelled cases can be reopened.');
  }

  const snapshot: ExitVersionSnapshot = {
    version: exitCase.version,
    status: exitCase.status,
    resignationDate: exitCase.resignationDate,
    lastWorkingDay: exitCase.lastWorkingDay,
    reasonCategory: exitCase.reasonCategory,
    reasonDetails: exitCase.reasonDetails,
    letterFileName: exitCase.letterFileName,
    snapshotAt: nowIso(),
    snapshotReason: reason ?? 'Reopened by HR/Admin',
  };

  exitCase.versions.unshift(snapshot);
  exitCase.version += 1;
  exitCase.status = 'Draft';
  exitCase.formLocked = false;
  exitCase.managerApproval = { status: 'Pending' };
  exitCase.hrApproval = { status: 'Pending' };
  exitCase.withdrawalRequest = null;
  exitCase.exitInterview = null;
  exitCase.fullAndFinal = null;
  exitCase.updatedAt = nowIso();
  exitCase.auditLogs.unshift(
    createAudit(
      actor,
      'RESIGNATION_REOPENED',
      `Case reopened as version ${exitCase.version}. Previous version preserved in history.`,
    ),
  );
  pushNotification({
    userId: exitCase.employeeId,
    title: 'Resignation reopened',
    message: 'HR reopened your resignation. You may resubmit an updated request.',
    relatedExitId: exitCase.id,
  });
  return exitCase;
}

export function completeExitInterview(
  actor: ExitActor,
  exitId: string,
  data: {
    primaryReason: string;
    experienceRating: number;
    managerRating: number;
    wouldRecommend: 'Yes' | 'No' | 'Maybe';
    likedMost: string;
    improvements: string;
    additionalComments?: string;
  },
): ExitCase {
  const exitCase = findExitById(exitId);
  if (!exitCase) throw new Error('Exit case not found.');
  if (!['Exit Interview Pending', 'Approved'].includes(exitCase.status)) {
    throw new Error('Exit Interview is not available for this case.');
  }
  if (isEmployeeRole(actor.role) && exitCase.employeeId !== actor.employeeId) {
    throw new Error('You can only complete your own exit interview.');
  }

  exitCase.exitInterview = {
    completed: true,
    ...data,
    additionalComments: data.additionalComments ?? '',
    completedAt: nowIso(),
  };
  exitCase.status = 'Exit Interview Completed';
  exitCase.updatedAt = nowIso();
  exitCase.auditLogs.unshift(createAudit(actor, 'EXIT_INTERVIEW_COMPLETED', 'Exit interview submitted.'));

  exitCase.status = 'Full & Final Pending';
  exitCase.fullAndFinal = {
    status: 'Pending',
    assetsReturned: false,
    accessRevoked: false,
    leaveEncashment: 0,
    gratuityAmount: 0,
    otherDues: 0,
    deductions: 0,
    netPayable: 0,
    paymentMode: '',
    remarks: '',
  };
  exitCase.auditLogs.unshift(
    createAudit(actor, 'FULL_AND_FINAL_ENABLED', 'Full & Final settlement stage enabled automatically.'),
  );
  pushNotification({
    userId: 'EMP006',
    role: 'FINANCE',
    title: 'Full & Final pending',
    message: `Full & Final settlement is ready for ${exitCase.employeeName}.`,
    relatedExitId: exitCase.id,
  });
  pushNotification({
    userId: exitCase.employeeId,
    title: 'Full & Final unlocked',
    message: 'Exit interview completed. Full & Final settlement is now in progress.',
    relatedExitId: exitCase.id,
  });

  return exitCase;
}

export function processFullAndFinal(
  actor: ExitActor,
  exitId: string,
  data: {
    assetsReturned: boolean;
    accessRevoked: boolean;
    leaveEncashment: number;
    gratuityAmount: number;
    otherDues: number;
    deductions: number;
    paymentMode: string;
    remarks?: string;
    complete: boolean;
  },
): ExitCase {
  const exitCase = findExitById(exitId);
  if (!exitCase) throw new Error('Exit case not found.');
  if (!['Full & Final Pending', 'Exit Interview Completed'].includes(exitCase.status)) {
    throw new Error('Full & Final is not available for this case.');
  }

  const netPayable = data.leaveEncashment + data.gratuityAmount + data.otherDues - data.deductions;
  exitCase.fullAndFinal = {
    status: data.complete ? 'Completed' : 'In Progress',
    assetsReturned: data.assetsReturned,
    accessRevoked: data.accessRevoked,
    leaveEncashment: data.leaveEncashment,
    gratuityAmount: data.gratuityAmount,
    otherDues: data.otherDues,
    deductions: data.deductions,
    netPayable,
    paymentMode: data.paymentMode,
    remarks: data.remarks ?? '',
    processedBy: actor.id,
    processedByName: actor.name,
    completedAt: data.complete ? nowIso() : undefined,
  };
  exitCase.updatedAt = nowIso();
  exitCase.auditLogs.unshift(
    createAudit(
      actor,
      data.complete ? 'FULL_AND_FINAL_COMPLETED' : 'FULL_AND_FINAL_UPDATED',
      data.complete ? 'Full & Final settlement completed.' : 'Full & Final settlement updated.',
    ),
  );

  if (data.complete) {
    if (!data.assetsReturned || !data.accessRevoked) {
      throw new Error('Assets must be returned and access revoked before completion.');
    }
    exitCase.status = 'Completed';
    pushNotification({
      userId: exitCase.employeeId,
      title: 'Exit process completed',
      message: 'Your Full & Final settlement is complete. Best wishes!',
      relatedExitId: exitCase.id,
    });
  }

  return exitCase;
}

export function listNotificationsForActor(actor: ExitActor) {
  return getNotificationsStore().filter(
    (item) =>
      item.userId === actor.id ||
      item.userId === actor.employeeId ||
      (item.role && item.role === actor.role),
  );
}

export function markNotificationRead(id: string, actor: ExitActor) {
  const item = getNotificationsStore().find((n) => n.id === id);
  if (!item) return null;
  if (item.userId !== actor.id && item.userId !== actor.employeeId && item.role !== actor.role) {
    throw new Error('Not allowed.');
  }
  item.read = true;
  return item;
}

export function statusTone(status: ExitStatus | string) {
  switch (status) {
    case 'Approved':
    case 'Exit Interview Completed':
    case 'Completed':
      return 'emerald';
    case 'Pending Approval':
    case 'Submitted':
    case 'Exit Interview Pending':
    case 'Full & Final Pending':
    case 'Draft':
      return 'amber';
    case 'Rejected':
    case 'Revoked':
    case 'Cancelled':
      return 'rose';
    default:
      return 'slate';
  }
}

export function roleLabel(role: AppRole | string) {
  return String(role)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
