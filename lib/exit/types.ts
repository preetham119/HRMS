import type { AppRole } from '@/lib/auth';

export type ExitStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Exit Interview Pending'
  | 'Exit Interview Completed'
  | 'Full & Final Pending'
  | 'Completed'
  | 'Revoked'
  | 'Cancelled';

export type ExitStage = 'resignation' | 'exitInterview' | 'fullAndFinal';
export type StageAccess = 'enabled' | 'locked' | 'completed';

export type ApprovalDecision = 'Pending' | 'Approved' | 'Rejected';
export type WithdrawalDecision = 'Pending' | 'Approved' | 'Rejected';

export interface ApprovalRecord {
  status: ApprovalDecision;
  actedBy?: string;
  actedByName?: string;
  comment?: string;
  actedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  reason: string;
  status: WithdrawalDecision;
  requestedAt: string;
  requestedBy: string;
  requestedByName: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface ExitInterviewData {
  completed: boolean;
  primaryReason: string;
  experienceRating: number;
  managerRating: number;
  wouldRecommend: 'Yes' | 'No' | 'Maybe' | '';
  likedMost: string;
  improvements: string;
  additionalComments: string;
  completedAt?: string;
}

export interface FullAndFinalData {
  status: 'Pending' | 'In Progress' | 'Completed';
  assetsReturned: boolean;
  accessRevoked: boolean;
  leaveEncashment: number;
  gratuityAmount: number;
  otherDues: number;
  deductions: number;
  netPayable: number;
  paymentMode: string;
  remarks: string;
  processedBy?: string;
  processedByName?: string;
  completedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: AppRole | string;
  details: string;
  timestamp: string;
}

export interface ExitNotification {
  id: string;
  userId: string;
  role?: AppRole;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedExitId: string;
}

export interface ExitVersionSnapshot {
  version: number;
  status: ExitStatus;
  resignationDate: string;
  lastWorkingDay: string;
  reasonCategory: string;
  reasonDetails: string;
  letterFileName?: string;
  snapshotAt: string;
  snapshotReason: string;
}

export interface ExitCase {
  id: string;
  version: number;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation: string;
  reportingManagerId: string;
  reportingManagerEmail: string;
  status: ExitStatus;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriodDays: number;
  reasonCategory: string;
  reasonDetails: string;
  letterFileName?: string;
  letterFileSize?: number;
  letterMimeType?: string;
  letterDataUrl?: string;
  managerApproval: ApprovalRecord;
  hrApproval: ApprovalRecord;
  withdrawalRequest: WithdrawalRequest | null;
  exitInterview: ExitInterviewData | null;
  fullAndFinal: FullAndFinalData | null;
  versions: ExitVersionSnapshot[];
  auditLogs: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
  formLocked: boolean;
}

export interface ExitActor {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  employeeId: string;
}

export const EXIT_STATUSES: ExitStatus[] = [
  'Draft',
  'Submitted',
  'Pending Approval',
  'Approved',
  'Rejected',
  'Exit Interview Pending',
  'Exit Interview Completed',
  'Full & Final Pending',
  'Completed',
  'Revoked',
  'Cancelled',
];

export const RESIGNATION_REASONS = [
  'Better Opportunity',
  'Personal Reasons',
  'Relocation',
  'Higher Education',
  'Health Reasons',
  'Compensation',
  'Work Environment',
  'Career Growth',
  'Other',
] as const;

export const EXIT_INTERVIEW_REASONS = [
  'Career Advancement',
  'Compensation & Benefits',
  'Work-Life Balance',
  'Management / Leadership',
  'Role / Responsibilities',
  'Company Culture',
  'Relocation',
  'Personal / Family',
  'Other',
] as const;
