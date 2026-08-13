import type { AppRole } from '@/lib/auth';

export type AppraisalStatus =
  | 'draft'
  | 'returned'
  | 'under_manager_review'
  | 'under_admin_review'
  | 'under_leadership_review'
  | 'completed';

export type CycleStatus = 'draft' | 'open' | 'closed' | 'archived';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';
export type ReviewStatus = 'draft' | 'submitted';

export type Competency = {
  id: string;
  name: string;
  description: string;
  isLeadershipOnly?: boolean;
};

export type AppraisalCycle = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
};

export type Goal = {
  id: string;
  employeeId: string;
  managerId: string;
  cycleId: string;
  name: string;
  description: string;
  kpi: string;
  weightage: number;
  target: string;
  progress: number;
  status: GoalStatus;
  dueDate: string;
};

export type ScoreEntry = {
  referenceId: string;
  score: number;
  comments?: string;
};

export type AppraisalDocument = {
  id: string;
  original_name: string;
  file_path: string;
  mime_type?: string;
  size?: number;
  uploaded_at?: string;
};

export type SelfAppraisal = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation: string;
  managerId: string;
  cycleId: string;
  achievements: string;
  challenges: string;
  selfFeedback: string;
  selfRating: number | null;
  competencyRatings: ScoreEntry[];
  goalRatings: ScoreEntry[];
  /** Proof of achievements uploaded by the employee. */
  documents: AppraisalDocument[];
  status: AppraisalStatus;
  submittedAt?: string;
  updatedAt: string;
};

export type ManagerReview = {
  appraisalId: string;
  managerId: string;
  goalRatings: ScoreEntry[];
  competencyRatings: ScoreEntry[];
  goalScore: number | null;
  competencyScore: number | null;
  overallRating: number | null;
  comments: string;
  developmentPlan: string;
  trainingRecommendation: string;
  recommendPromotion: boolean;
  recommendIncrement: boolean;
  status: ReviewStatus;
  submittedAt?: string;
};

export type StageReview = {
  appraisalId: string;
  reviewerId: string;
  comments: string;
  developmentPlan: string;
  strengths: string;
  improvements: string;
  recommendPromotion: boolean;
  recommendIncrement: boolean;
  salaryRevision: string;
  roleChange: string;
  training: string;
  highPotential: boolean;
  finalRating: number | null;
  /** Optional per-competency scores (Admin / Leadership). */
  competencyRatings?: ScoreEntry[];
  status: ReviewStatus;
  submittedAt?: string;
};

export type AppraisalNotification = {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export type DemoEmployee = {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation: string;
  managerId: string;
};

export type AppraisalStoreState = {
  cycles: AppraisalCycle[];
  competencies: Competency[];
  goals: Goal[];
  appraisals: SelfAppraisal[];
  managerReviews: ManagerReview[];
  adminReviews: StageReview[];
  leadershipReviews: StageReview[];
  notifications: AppraisalNotification[];
};

export type AppraisalActor = {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: AppRole;
  department?: string;
};

export const WORKFLOW_STEPS = [
  { id: 'self', label: 'Self Appraisal' },
  { id: 'manager', label: 'Manager Review' },
  { id: 'admin', label: 'Admin Review' },
  { id: 'leadership', label: 'Leadership' },
] as const;
