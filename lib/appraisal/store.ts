import { createInitialAppraisalState, DEMO_EMPLOYEES } from '@/lib/appraisal/seed';
import {
  calcCompetencyScore,
  calcGoalScore,
  calcOverallRating,
} from '@/lib/appraisal/ratings';
import type {
  AppraisalActor,
  AppraisalCycle,
  AppraisalNotification,
  AppraisalStoreState,
  DemoEmployee,
  ManagerReview,
  ScoreEntry,
  SelfAppraisal,
  StageReview,
} from '@/lib/appraisal/types';

/** Bump when demo seed / workflow contract changes so browsers reload fresh state. */
const STORAGE_KEY = 'hrms-appraisal-store-v7';

function cloneState(): AppraisalStoreState {
  return structuredClone(createInitialAppraisalState());
}

function normalizeState(state: AppraisalStoreState): AppraisalStoreState {
  return {
    ...state,
    notifications: Array.isArray(state.notifications) ? state.notifications : [],
    managerReviews: state.managerReviews || [],
    adminReviews: state.adminReviews || [],
    leadershipReviews: state.leadershipReviews || [],
    appraisals: (state.appraisals || []).map((appraisal) => ({
      ...appraisal,
      documents: Array.isArray(appraisal.documents) ? appraisal.documents : [],
    })),
    goals: state.goals || [],
    cycles: state.cycles || [],
    competencies: state.competencies || [],
  };
}

function readStore(): AppraisalStoreState {
  if (typeof window === 'undefined') return cloneState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = cloneState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return normalizeState(JSON.parse(raw) as AppraisalStoreState);
  } catch {
    const initial = cloneState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function writeStore(state: AppraisalStoreState) {
  if (typeof window === 'undefined') return state;
  const next = normalizeState(state);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function touch<T extends { updatedAt?: string }>(item: T): T {
  return { ...item, updatedAt: new Date().toISOString() };
}

function makeNotification(
  recipientId: string,
  title: string,
  message: string,
  link?: string,
): AppraisalNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recipientId,
    title,
    message,
    link,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
}

function pushNotifications(state: AppraisalStoreState, notes: AppraisalNotification[]) {
  return {
    ...state,
    notifications: [...notes, ...(state.notifications || [])].slice(0, 200),
  };
}

export function getAppraisalState() {
  return readStore();
}

export function resetAppraisalState() {
  return writeStore(cloneState());
}

/** Persists a complete state update for the client-side appraisal adapter. */
export function updateAppraisalState(
  updater: (state: AppraisalStoreState) => AppraisalStoreState,
) {
  return writeStore(updater(readStore()));
}

/** Only returns a truly open cycle — never falls back to a closed/draft one. */
export function getOpenCycle(state = readStore()) {
  return state.cycles.find((cycle) => cycle.status === 'open') ?? null;
}

export function listGoalsForEmployee(
  employeeId: string,
  state = readStore(),
  cycleId?: string | null,
) {
  const resolvedCycleId = cycleId ?? getOpenCycle(state)?.id;
  return state.goals.filter(
    (goal) => goal.employeeId === employeeId && (!resolvedCycleId || goal.cycleId === resolvedCycleId),
  );
}

export function listNotificationsForRecipient(recipientId: string, state = readStore()) {
  return (state.notifications || []).filter((item) => item.recipientId === recipientId);
}

export function markNotificationRead(id: string) {
  const state = readStore();
  return writeStore({
    ...state,
    notifications: state.notifications.map((item) =>
      item.id === id ? { ...item, isRead: true } : item,
    ),
  });
}

export function markAllNotificationsRead(recipientId: string) {
  const state = readStore();
  return writeStore({
    ...state,
    notifications: state.notifications.map((item) =>
      item.recipientId === recipientId ? { ...item, isRead: true } : item,
    ),
  });
}

/**
 * HR opens a cycle: close other open cycles, ensure draft appraisals for demo employees,
 * and notify employees + manager that the cycle is open.
 */
export function openAppraisalCycle(
  cycleId: string,
  employees: DemoEmployee[] = DEMO_EMPLOYEES,
) {
  let state = readStore();
  const target = state.cycles.find((cycle) => cycle.id === cycleId);
  if (!target) throw new Error('Cycle not found.');

  const cycles = state.cycles.map((cycle) => {
    if (cycle.id === cycleId) return { ...cycle, status: 'open' as const };
    if (cycle.status === 'open') return { ...cycle, status: 'closed' as const };
    return cycle;
  });

  const now = new Date().toISOString();
  let appraisals = [...state.appraisals];
  let goals = [...state.goals];
  for (const emp of employees) {
    const existing = appraisals.find(
      (item) => item.employeeId === emp.employeeId && item.cycleId === cycleId,
    );
    if (!existing) {
      appraisals.push({
        id: `apr-${emp.employeeId.toLowerCase()}-${cycleId}`,
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        employeeEmail: emp.employeeEmail,
        department: emp.department,
        designation: emp.designation,
        managerId: emp.managerId,
        cycleId,
        achievements: '',
        challenges: '',
        selfFeedback: '',
        selfRating: null,
        competencyRatings: [],
        goalRatings: [],
        documents: [],
        status: 'draft',
        updatedAt: now,
      });
    }

    // Ensure the open cycle has goals for this employee (clone from any prior cycle if needed).
    const hasGoals = goals.some((goal) => goal.employeeId === emp.employeeId && goal.cycleId === cycleId);
    if (!hasGoals) {
      const templates = state.goals.filter((goal) => goal.employeeId === emp.employeeId);
      if (templates.length) {
        goals = [
          ...goals,
          ...templates.map((goal, index) => ({
            ...goal,
            id: `${goal.id}-${cycleId}-${index}`,
            cycleId,
            progress: goal.progress ?? 0,
            status: goal.status || 'in_progress',
          })),
        ];
      }
    }
  }

  const openCycle = cycles.find((cycle) => cycle.id === cycleId)!;
  const notes: AppraisalNotification[] = [
    ...employees.map((emp) =>
      makeNotification(
        emp.employeeId,
        'Appraisal cycle opened',
        `${openCycle.name} is now open. Please complete and submit your self-appraisal.`,
        selfAppraisalLink(emp.employeeId),
      ),
    ),
    makeNotification(
      'EMP005',
      'Cycle opened',
      `${openCycle.name} is open. Track status in Reports as reviews move Employee → Manager → Admin → CEO.`,
      '/hr/reports',
    ),
  ];

  state = writeStore(pushNotifications({ ...state, cycles, appraisals, goals }, notes));
  return state;
}

function selfAppraisalLink(employeeId: string) {
  return employeeId === 'EMP004' ? '/manager/self-appraisal' : '/employee/self-appraisal';
}

export function getOrCreateSelfAppraisal(actor: AppraisalActor, state = readStore()) {
  const cycle = getOpenCycle(state);
  if (!cycle) return { state, appraisal: null as SelfAppraisal | null };

  const employeeId = actor.employeeId || actor.id;
  if (!employeeId) return { state, appraisal: null as SelfAppraisal | null };

  let appraisal = state.appraisals.find(
    (item) => item.employeeId === employeeId && item.cycleId === cycle.id,
  );

  const role = String(actor.role || '').toUpperCase();
  const canSelfAppraise =
    role === 'EMPLOYEE_PR' ||
    role === 'EMPLOYEE_CONT' ||
    role === 'EMPLOYEE' ||
    role === 'MANAGER' ||
    role === 'ADMIN' ||
    role === 'CEO' ||
    role === 'FINANCE' ||
    role === '';

  if (!appraisal && canSelfAppraise) {
    const demo = DEMO_EMPLOYEES.find((item) => item.employeeId === employeeId);
    appraisal = {
      id: `apr-${String(employeeId).toLowerCase()}`,
      employeeId,
      employeeName: actor.name || demo?.employeeName || 'Employee',
      employeeEmail: actor.email || demo?.employeeEmail || '',
      department: actor.department || demo?.department || 'General',
      designation:
        demo?.designation
        || (role === 'MANAGER' ? 'Engineering Manager' : role === 'FINANCE' ? 'Finance Associate' : 'Employee'),
      managerId: demo?.managerId || (role === 'MANAGER' ? 'EMP008' : 'EMP004'),
      cycleId: cycle.id,
      achievements: '',
      challenges: '',
      selfFeedback: '',
      selfRating: null,
      competencyRatings: [],
      goalRatings: [],
      documents: [],
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    state = writeStore({ ...state, appraisals: [...state.appraisals, appraisal] });
  }

  // Backfill documents for appraisals created before this field existed.
  if (appraisal && !Array.isArray(appraisal.documents)) {
    appraisal.documents = [];
  }

  return { state, appraisal: appraisal ?? null };
}

export function saveSelfAppraisal(
  actor: AppraisalActor,
  payload: {
    achievements: string;
    challenges: string;
    selfFeedback: string;
    selfRating: number | null;
    competencyRatings: ScoreEntry[];
    goalRatings: ScoreEntry[];
    documents?: SelfAppraisal['documents'];
    submit?: boolean;
  },
) {
  let state = readStore();
  const current = getOrCreateSelfAppraisal(actor, state);
  state = current.state;
  const appraisal = current.appraisal;
  if (!appraisal) throw new Error('No open cycle available.');
  if (!['draft', 'returned'].includes(appraisal.status)) {
    throw new Error('Appraisal is locked for editing.');
  }
  if (payload.submit) {
    if (!payload.achievements.trim()) throw new Error('Achievements are required.');
    if ((payload.competencyRatings?.length || 0) < 3) {
      throw new Error('Rate at least 3 competencies before submitting.');
    }
  }

  const next: SelfAppraisal = touch({
    ...appraisal,
    achievements: payload.achievements,
    challenges: payload.challenges,
    selfFeedback: payload.selfFeedback,
    selfRating: payload.selfRating,
    competencyRatings: payload.competencyRatings,
    goalRatings: payload.goalRatings,
    documents: payload.documents ?? appraisal.documents ?? [],
    status: payload.submit
      ? 'under_manager_review'
      : appraisal.status === 'returned'
        ? 'draft'
        : appraisal.status,
    submittedAt: payload.submit ? new Date().toISOString() : appraisal.submittedAt,
  });

  state = {
    ...state,
    appraisals: state.appraisals.map((item) => (item.id === next.id ? next : item)),
  };

  if (payload.submit) {
    state = pushNotifications(state, [
      makeNotification(
        next.managerId,
        'Self-appraisal submitted',
        `${next.employeeName} submitted their self-appraisal. Please complete your manager review.`,
        '/manager/pending-reviews',
      ),
      makeNotification(
        'EMP005',
        'Self-appraisal submitted',
        `${next.employeeName} submitted self-appraisal. Status: Manager Review.`,
        '/hr/reports',
      ),
    ]);
  }

  state = writeStore(state);
  return next;
}

export function listManagerPending(managerId: string, state = readStore()) {
  return state.appraisals.filter(
    (item) => item.managerId === managerId && item.status === 'under_manager_review',
  );
}

export function listManagerCompleted(managerId: string, state = readStore()) {
  return state.appraisals.filter(
    (item) =>
      item.managerId === managerId &&
      ['under_admin_review', 'under_leadership_review', 'completed'].includes(item.status),
  );
}

export function saveManagerReview(
  actor: AppraisalActor,
  appraisalId: string,
  payload: Omit<ManagerReview, 'appraisalId' | 'managerId' | 'goalScore' | 'competencyScore' | 'overallRating' | 'submittedAt'> & {
    submit?: boolean;
  },
) {
  let state = readStore();
  const appraisal = state.appraisals.find((item) => item.id === appraisalId);
  if (!appraisal) throw new Error('Appraisal not found.');
  if (appraisal.managerId !== actor.employeeId) throw new Error('Not authorized for this review.');
  if (appraisal.status !== 'under_manager_review' && payload.submit) {
    throw new Error('Appraisal is not awaiting manager review.');
  }

  const goals = listGoalsForEmployee(appraisal.employeeId, state, appraisal.cycleId);
  const goalScore = calcGoalScore(payload.goalRatings, goals);
  const competencyScore = calcCompetencyScore(payload.competencyRatings);
  const overallRating = calcOverallRating(goalScore, competencyScore);

  const review: ManagerReview = {
    appraisalId,
    managerId: actor.employeeId,
    goalRatings: payload.goalRatings,
    competencyRatings: payload.competencyRatings,
    goalScore,
    competencyScore,
    overallRating,
    comments: payload.comments,
    developmentPlan: payload.developmentPlan,
    trainingRecommendation: payload.trainingRecommendation,
    recommendPromotion: payload.recommendPromotion,
    recommendIncrement: payload.recommendIncrement,
    status: payload.submit ? 'submitted' : 'draft',
    submittedAt: payload.submit ? new Date().toISOString() : undefined,
  };

  const reviews = state.managerReviews.filter((item) => item.appraisalId !== appraisalId);
  reviews.push(review);

  const appraisals = state.appraisals.map((item) =>
    item.id === appraisalId && payload.submit
      ? touch({ ...item, status: 'under_admin_review' as const })
      : item,
  );

  state = { ...state, managerReviews: reviews, appraisals };

  if (payload.submit) {
    state = pushNotifications(state, [
      makeNotification(
        'EMP007',
        'Manager review submitted',
        `${appraisal.employeeName}'s appraisal is ready for admin review.`,
        '/admin/approvals',
      ),
      makeNotification(
        'EMP005',
        'Moved to Admin Review',
        `${appraisal.employeeName}: Manager review complete → Admin Review.`,
        '/hr/reports',
      ),
      makeNotification(
        appraisal.employeeId,
        'Manager review completed',
        'Your manager submitted their review. Your appraisal is now with Admin.',
        '/employee/dashboard',
      ),
    ]);
  }

  state = writeStore(state);
  return { review, appraisal: appraisals.find((item) => item.id === appraisalId)! };
}

export function listAdminQueue(state = readStore()) {
  return state.appraisals.filter((item) => item.status === 'under_admin_review');
}

export function listLeadershipQueue(state = readStore()) {
  return state.appraisals.filter((item) => item.status === 'under_leadership_review');
}

export function saveAdminReview(
  actor: AppraisalActor,
  appraisalId: string,
  payload: Omit<StageReview, 'appraisalId' | 'reviewerId' | 'submittedAt'> & { submit?: boolean },
) {
  let state = readStore();
  const appraisal = state.appraisals.find((item) => item.id === appraisalId);
  if (!appraisal) throw new Error('Appraisal not found.');
  if (appraisal.status !== 'under_admin_review' && payload.submit) {
    throw new Error('Appraisal is not awaiting admin review.');
  }

  const review: StageReview = {
    appraisalId,
    reviewerId: actor.employeeId,
    comments: payload.comments,
    developmentPlan: payload.developmentPlan,
    strengths: payload.strengths,
    improvements: payload.improvements,
    recommendPromotion: payload.recommendPromotion,
    recommendIncrement: payload.recommendIncrement,
    salaryRevision: payload.salaryRevision,
    roleChange: payload.roleChange,
    training: payload.training,
    highPotential: payload.highPotential,
    finalRating: payload.finalRating,
    competencyRatings: payload.competencyRatings || [],
    status: payload.submit ? 'submitted' : 'draft',
    submittedAt: payload.submit ? new Date().toISOString() : undefined,
  };

  const reviews = state.adminReviews.filter((item) => item.appraisalId !== appraisalId);
  reviews.push(review);
  const appraisals = state.appraisals.map((item) =>
    item.id === appraisalId && payload.submit
      ? touch({ ...item, status: 'under_leadership_review' as const })
      : item,
  );

  state = { ...state, adminReviews: reviews, appraisals };

  if (payload.submit) {
    state = pushNotifications(state, [
      makeNotification(
        'EMP008',
        'Admin review submitted',
        `${appraisal.employeeName}'s appraisal is ready for leadership approval.`,
        '/leadership/approvals',
      ),
      makeNotification(
        'EMP005',
        'Moved to Leadership Review',
        `${appraisal.employeeName}: Admin review complete → CEO / Leadership.`,
        '/hr/reports',
      ),
    ]);
  }

  state = writeStore(state);
  return { review, appraisal: appraisals.find((item) => item.id === appraisalId)! };
}

export function saveLeadershipReview(
  actor: AppraisalActor,
  appraisalId: string,
  payload: Omit<StageReview, 'appraisalId' | 'reviewerId' | 'submittedAt'> & { submit?: boolean },
) {
  let state = readStore();
  const appraisal = state.appraisals.find((item) => item.id === appraisalId);
  if (!appraisal) throw new Error('Appraisal not found.');
  if (appraisal.status !== 'under_leadership_review' && payload.submit) {
    throw new Error('Appraisal is not awaiting leadership review.');
  }

  const review: StageReview = {
    appraisalId,
    reviewerId: actor.employeeId,
    comments: payload.comments,
    developmentPlan: payload.developmentPlan,
    strengths: payload.strengths,
    improvements: payload.improvements,
    recommendPromotion: payload.recommendPromotion,
    recommendIncrement: payload.recommendIncrement,
    salaryRevision: payload.salaryRevision,
    roleChange: payload.roleChange,
    training: payload.training,
    highPotential: payload.highPotential,
    finalRating: payload.finalRating,
    competencyRatings: payload.competencyRatings || [],
    status: payload.submit ? 'submitted' : 'draft',
    submittedAt: payload.submit ? new Date().toISOString() : undefined,
  };

  const reviews = state.leadershipReviews.filter((item) => item.appraisalId !== appraisalId);
  reviews.push(review);
  const appraisals = state.appraisals.map((item) =>
    item.id === appraisalId && payload.submit
      ? touch({ ...item, status: 'completed' as const })
      : item,
  );

  state = { ...state, leadershipReviews: reviews, appraisals };

  if (payload.submit) {
    state = pushNotifications(state, [
      makeNotification(
        'EMP005',
        'Appraisal completed',
        `${appraisal.employeeName}'s appraisal is fully completed by Leadership. View status in Reports.`,
        '/hr/reports',
      ),
      makeNotification(
        appraisal.employeeId,
        'Appraisal completed',
        'Leadership finalized your appraisal. You can view feedback in the Performance module.',
        '/employee/feedback',
      ),
      makeNotification(
        appraisal.managerId,
        'Appraisal completed',
        `${appraisal.employeeName}'s appraisal cycle is complete.`,
        '/manager/completed-reviews',
      ),
    ]);
  }

  state = writeStore(state);
  return { review, appraisal: appraisals.find((item) => item.id === appraisalId)! };
}

export function upsertCycle(cycle: AppraisalCycle) {
  const state = readStore();
  const exists = state.cycles.some((item) => item.id === cycle.id);
  const cycles = exists
    ? state.cycles.map((item) => (item.id === cycle.id ? cycle : item))
    : [...state.cycles, cycle];
  return writeStore({ ...state, cycles });
}

export function getAppraisalBundle(appraisalId: string, state = readStore()) {
  const appraisal = state.appraisals.find((item) => item.id === appraisalId) ?? null;
  if (!appraisal) return null;
  return {
    appraisal,
    goals: listGoalsForEmployee(appraisal.employeeId, state, appraisal.cycleId),
    managerReview: state.managerReviews.find((item) => item.appraisalId === appraisalId) ?? null,
    adminReview: state.adminReviews.find((item) => item.appraisalId === appraisalId) ?? null,
    leadershipReview: state.leadershipReviews.find((item) => item.appraisalId === appraisalId) ?? null,
    competencies: state.competencies,
    cycle: state.cycles.find((item) => item.id === appraisal.cycleId) ?? null,
  };
}

export function computeWorkflowPercent(status: string) {
  switch (status) {
    case 'draft':
    case 'returned':
      return 15;
    case 'under_manager_review':
      return 40;
    case 'under_admin_review':
      return 65;
    case 'under_leadership_review':
      return 85;
    case 'completed':
      return 100;
    default:
      return 0;
  }
}
