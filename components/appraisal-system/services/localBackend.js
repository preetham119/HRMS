import { DEMO_EMPLOYEES } from '../../../lib/appraisal/seed';
import {
  getAppraisalBundle,
  getAppraisalState,
  getOpenCycle,
  getOrCreateSelfAppraisal,
  listAdminQueue,
  listGoalsForEmployee,
  listLeadershipQueue,
  listManagerCompleted,
  listManagerPending,
  listNotificationsForRecipient,
  markAllNotificationsRead,
  markNotificationRead,
  openAppraisalCycle,
  resetAppraisalState,
  saveAdminReview as persistAdminReview,
  saveLeadershipReview as persistLeadershipReview,
  saveManagerReview as persistManagerReview,
  saveSelfAppraisal as persistSelfAppraisal,
  updateAppraisalState,
  upsertCycle,
} from '../../../lib/appraisal/store';

const ok = (data, message) => Promise.resolve({ data: { success: true, data, ...(message ? { message } : {}) } });
const fail = (message) => Promise.reject({ response: { data: { message: message || 'Request failed' } } });
const wrap = (fn) => {
  try {
    return fn();
  } catch (error) {
    return fail(error?.message || 'Request failed');
  }
};
const now = () => new Date().toISOString();

const PEOPLE = [
  { id: 'EMP001', employee_code: 'EMP001', first_name: 'Rajesh', last_name: 'Kumar', name: 'Rajesh Kumar', email: 'employee@company.com', designation: 'Senior QA Lead', department: 'Quality Assurance', department_name: 'Quality Assurance', manager_id: 'MGR001', active: true },
  { id: 'EMP002', employee_code: 'EMP002', first_name: 'Sneha', last_name: 'Reddy', name: 'Sneha Reddy', email: 'employee2@company.com', designation: 'Frontend Developer', department: 'Engineering', department_name: 'Engineering', manager_id: 'MGR001', active: true },
  { id: 'EMP003', employee_code: 'EMP003', first_name: 'Karthik', last_name: 'Iyer', name: 'Karthik Iyer', email: 'employee3@company.com', designation: 'Backend Developer', department: 'Engineering', department_name: 'Engineering', manager_id: 'MGR001', active: true },
  { id: 'MGR001', employee_code: 'MGR001', first_name: 'Anita', last_name: 'Desai', name: 'Anita Desai', email: 'manager@company.com', designation: 'Engineering Manager', department: 'Engineering', department_name: 'Engineering', active: true },
  { id: 'HR001', employee_code: 'HR001', first_name: 'HR', last_name: 'Admin', name: 'HR Admin', email: 'hr@company.com', designation: 'HR Manager', department: 'Human Resources', department_name: 'Human Resources', active: true },
  { id: 'ADM001', employee_code: 'ADM001', first_name: 'System', last_name: 'Admin', name: 'System Admin', email: 'admin@company.com', designation: 'Administrator', department: 'Administration', department_name: 'Administration', active: true },
  { id: 'CEO001', employee_code: 'CEO001', first_name: 'Arjun', last_name: 'Mehta', name: 'Arjun Mehta', email: 'ceo@company.com', designation: 'Chief Executive Officer', department: 'Executive Office', department_name: 'Executive Office', active: true },
];

const DEPARTMENTS = [
  { id: 'dept-qa', name: 'Quality Assurance', code: 'QA', manager_id: 'MGR001', employee_count: 1 },
  { id: 'dept-eng', name: 'Engineering', code: 'ENG', manager_id: 'MGR001', employee_count: 2 },
  { id: 'dept-hr', name: 'Human Resources', code: 'HR', employee_count: 1 },
];

const EMAIL_EMPLOYEE_IDS = {
  'employee@company.com': 'EMP001',
  'employee2@company.com': 'EMP002',
  'sneha.reddy@company.com': 'EMP002',
  'employee3@company.com': 'EMP003',
  'manager@company.com': 'MGR001',
  'hr@company.com': 'HR001',
  'admin@company.com': 'ADM001',
  'ceo@company.com': 'CEO001',
  'finance@company.com': 'FIN001',
};

function actor() {
  const bridged = typeof window !== 'undefined' ? window.__HRMS_APPRAISAL_USER__ : null;
  const fallback = {
    id: 'EMP001',
    employeeId: 'EMP001',
    email: 'employee@company.com',
    role: 'employee',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    department: 'Quality Assurance',
  };
  if (!bridged) return fallback;
  const email = String(bridged.email || '').toLowerCase();
  const employeeId =
    bridged.employeeId
    || EMAIL_EMPLOYEE_IDS[email]
    || (String(bridged.id || '').startsWith('EMP') ? bridged.id : null)
    || fallback.employeeId;
  return {
    ...fallback,
    ...bridged,
    email: bridged.email || fallback.email,
    employeeId,
    id: bridged.id || employeeId,
    role: bridged.role || fallback.role,
  };
}

function storeActor() {
  const user = actor();
  const roleMap = {
    employee: 'EMPLOYEE',
    EMPLOYEE: 'EMPLOYEE',
    manager: 'MANAGER',
    MANAGER: 'MANAGER',
    hr: 'HR',
    HR: 'HR',
    admin: 'ADMIN',
    ADMIN: 'ADMIN',
    leadership: 'CEO',
    CEO: 'CEO',
    finance: 'FINANCE',
    FINANCE: 'FINANCE',
  };
  return {
    id: user.id || user.employeeId,
    employeeId: user.employeeId || user.id,
    email: user.email,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email,
    role: roleMap[user.role] || 'EMPLOYEE',
    department: user.department,
  };
}

function snakeGoal(goal, state = getAppraisalState()) {
  const cycle = state.cycles.find((item) => item.id === goal.cycleId);
  return { ...goal, goal_name: goal.name, start_date: cycle?.startDate, end_date: goal.dueDate, cycle_name: cycle?.name };
}

function snakeCycle(cycle, state = getAppraisalState()) {
  return { ...cycle, start_date: cycle.startDate, end_date: cycle.endDate, appraisal_count: state.appraisals.filter((a) => a.cycleId === cycle.id).length };
}

function reviewRows(appraisals) {
  const state = getAppraisalState();
  return appraisals.map((appraisal) => {
    const person = PEOPLE.find((p) => p.id === appraisal.employeeId) || {};
    const cycle = state.cycles.find((c) => c.id === appraisal.cycleId);
    const manager = state.managerReviews.find((r) => r.appraisalId === appraisal.id);
    const admin = state.adminReviews.find((r) => r.appraisalId === appraisal.id);
    const leadership = state.leadershipReviews.find((r) => r.appraisalId === appraisal.id);
    return {
      ...person,
      id: appraisal.id,
      appraisal_id: appraisal.id,
      employee_id: appraisal.employeeId,
      employee_name: appraisal.employeeName,
      employee_code: appraisal.employeeId,
      department_name: appraisal.department,
      department: appraisal.department,
      designation: appraisal.designation,
      email: appraisal.employeeEmail,
      cycle_name: cycle?.name,
      submitted_at: appraisal.submittedAt,
      reviewed_at: manager?.submittedAt || appraisal.submittedAt,
      status: appraisal.status,
      self_rating: appraisal.selfRating,
      manager_rating: manager?.overallRating ?? null,
      overall_rating: manager?.overallRating ?? null,
      final_rating: leadership?.finalRating ?? admin?.finalRating ?? null,
      hr_rating: admin?.finalRating ?? null,
      progress: appraisal.status === 'completed' ? 100 : appraisal.status === 'under_leadership_review' ? 85 : appraisal.status === 'under_admin_review' ? 65 : appraisal.status === 'under_manager_review' ? 40 : 15,
      rating: leadership?.finalRating ?? admin?.finalRating ?? manager?.overallRating ?? appraisal.selfRating,
    };
  });
}

function ratingsFor(bundle) {
  const make = (entries, ratedBy, type) => (entries || []).map((entry) => ({
    reference_id: entry.referenceId,
    score: entry.score,
    comments: entry.comments,
    rated_by: ratedBy,
    rating_type: type,
  }));
  return [
    ...make(bundle.appraisal.competencyRatings, 'employee', 'competency'),
    ...make(bundle.appraisal.goalRatings, 'employee', 'goal'),
    ...make(bundle.managerReview?.competencyRatings, 'manager', 'competency'),
    ...make(bundle.managerReview?.goalRatings, 'manager', 'goal'),
  ];
}

function bundleFor(id) {
  const bundle = getAppraisalBundle(id);
  if (!bundle) return null;
  const { appraisal, goals, competencies, managerReview, adminReview, leadershipReview, cycle } = bundle;
  const manager = PEOPLE.find((p) => p.id === appraisal.managerId);
  return {
    appraisal: {
      ...appraisal,
      self_feedback: appraisal.selfFeedback,
      self_rating: appraisal.selfRating,
      employee_name: appraisal.employeeName,
      employee_code: appraisal.employeeId,
      department_name: appraisal.department,
      manager_name: manager?.name || null,
      cycle_name: cycle?.name,
    },
    goals: goals.map((goal) => snakeGoal(goal)),
    competencies: competencies.map((item) => ({ ...item, is_leadership_only: item.isLeadershipOnly })),
    ratings: ratingsFor(bundle),
    managerReview: managerReview && {
      ...managerReview,
      overall_rating: managerReview.overallRating,
      goal_score: managerReview.goalScore,
      competency_score: managerReview.competencyScore,
      recommend_promotion: managerReview.recommendPromotion,
      recommend_increment: managerReview.recommendIncrement,
      recommend_training: managerReview.trainingRecommendation,
      development_plan: managerReview.developmentPlan,
    },
    adminReview: adminReview && stageReviewForUi(adminReview),
    /** Alias for leadership UI that historically read hrReview. */
    hrReview: adminReview && stageReviewForUi(adminReview),
    leadershipReview: leadershipReview && stageReviewForUi(leadershipReview),
    employeeSelf: { self_rating: appraisal.selfRating },
  };
}

/** Detail payload for HR/Manager Reports dialogs (includes stages + progress). */
function progressDetailFor(id) {
  let base = bundleFor(id);
  // Fallback: allow lookup by employee code if appraisal id was not passed
  if (!base) {
    const byEmployee = getAppraisalState().appraisals.find(
      (a) => a.id === id || a.employeeId === id || a.employeeId === String(id),
    );
    if (byEmployee) base = bundleFor(byEmployee.id);
  }
  if (!base) return null;
  const { appraisal, managerReview, adminReview, leadershipReview } = base;
  const status = appraisal.status || 'draft';
  const selfDone = ['under_manager_review', 'under_hr_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(status)
    || Boolean(appraisal.submittedAt || appraisal.submitted_at);
  const managerDone = managerReview?.status === 'submitted'
    || ['under_hr_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(status);
  const adminDone = adminReview?.status === 'submitted'
    || ['under_leadership_review', 'completed'].includes(status);
  const leadershipDone = leadershipReview?.status === 'submitted' || status === 'completed';
  const stages = [
    { id: 'self', label: 'Self Evaluation', done: selfDone, date: appraisal.submittedAt || appraisal.submitted_at || null },
    { id: 'manager', label: 'Manager Review', done: managerDone, date: managerReview?.submittedAt || managerReview?.submitted_at || null },
    { id: 'admin', label: 'Admin Review', done: adminDone, date: adminReview?.submittedAt || adminReview?.submitted_at || null },
    { id: 'leadership', label: 'Leadership Review', done: leadershipDone, date: leadershipReview?.submittedAt || leadershipReview?.submitted_at || null },
  ];
  const completedSteps = stages.filter((s) => s.done).length;
  const progress = Math.round((completedSteps / stages.length) * 100);
  return {
    ...base,
    progress,
    stages,
    self_done: selfDone,
    manager_done: managerDone,
    admin_done: adminDone,
    leadership_done: leadershipDone,
    hrReview: adminReview || null,
    documents: appraisal.documents || [],
  };
}

function stageReviewForUi(review) {
  return {
    ...review,
    development_plan: review.developmentPlan,
    recommend_promotion: review.recommendPromotion,
    recommend_increment: review.recommendIncrement,
    salary_revision: review.salaryRevision,
    role_change: review.roleChange,
    recommended_training: review.training,
    high_potential: review.highPotential,
    final_rating: review.finalRating,
  };
}

function buildWorkflow(status = 'draft', role = 'employee') {
  const templates = {
    employee: [
      { id: 'goals', label: 'Set Goals' },
      { id: 'self', label: 'Self Assessment' },
      { id: 'manager', label: 'Manager Review' },
      { id: 'admin', label: 'Admin' },
      { id: 'leadership', label: 'Leadership' },
    ],
    manager: [
      { id: 'team_goals', label: 'Team Goal Setting' },
      { id: 'team_self', label: 'Team Self Assessment' },
      { id: 'review', label: 'Review Assessments' },
      { id: 'feedback', label: 'Provide Feedback' },
      { id: 'finalize', label: 'Finalize Review' },
    ],
    hr: [
      { id: 'setup', label: 'Open Appraisal Cycle' },
      { id: 'reports', label: 'View Reports' },
      { id: 'send', label: 'Monitor Pipeline' },
    ],
    admin: [
      { id: 'cycle', label: 'Cycle Open' },
      { id: 'intake', label: 'Reviews Received' },
      { id: 'recommend', label: 'Admin Review' },
      { id: 'final', label: 'Send to Leadership' },
    ],
    leadership: [
      { id: 'cycle', label: 'Cycle Open' },
      { id: 'intake', label: 'Reviews Received' },
      { id: 'recommend', label: 'Recommendations' },
      { id: 'final', label: 'Team Finalized' },
    ],
  };
  const stepsDef = templates[role] || templates.employee;
  let activeIndex = 0;
  if (role === 'employee') {
    if (status === 'completed') activeIndex = stepsDef.length;
    else if (status === 'under_leadership_review') activeIndex = 4;
    else if (status === 'under_admin_review') activeIndex = 3;
    else if (status === 'under_manager_review') activeIndex = 2;
    else if (status === 'draft' || status === 'returned') activeIndex = 1;
    else activeIndex = 0;
  } else if (status === 'completed') {
    activeIndex = stepsDef.length;
  } else {
    activeIndex = Math.min(2, stepsDef.length - 1);
  }
  const steps = stepsDef.map((step, index) => ({
    ...step,
    number: index + 1,
    done: index < activeIndex,
    status: index < activeIndex ? 'completed' : index === activeIndex ? 'active' : 'pending',
  }));
  const percent = Math.round((Math.min(activeIndex, stepsDef.length) / stepsDef.length) * 100);
  return {
    percent: status === 'completed' ? 100 : percent,
    steps,
    completedSteps: steps.filter((s) => s.done).length,
    totalSteps: steps.length,
    nextAction:
      status === 'completed'
        ? 'All steps complete. No further action needed.'
        : role === 'employee' && (status === 'draft' || status === 'returned')
          ? 'Complete and submit your self-assessment.'
          : role === 'manager'
            ? 'Review pending team appraisals.'
            : role === 'admin'
              ? 'Complete pending admin reviews.'
              : role === 'leadership'
                ? 'Complete pending leadership approvals.'
                : 'Monitor appraisal progress.',
    actionLink:
      role === 'employee'
        ? '/employee/self-appraisal'
        : role === 'manager'
          ? '/manager/pending-reviews'
          : role === 'admin'
            ? '/admin/approvals'
            : role === 'leadership'
              ? '/leadership/approvals'
              : '/hr/reports',
    actionLabel: role === 'employee' ? 'Open Self Appraisal' : 'Open Queue',
  };
}

function profileBanner(extra = {}) {
  const u = actor();
  const person = PEOPLE.find((p) => p.id === u.employeeId) || {};
  const state = getAppraisalState();
  const cycle = getOpenCycle(state);
  const appraisal = state.appraisals.find((item) => item.employeeId === u.employeeId);
  const manager = PEOPLE.find((p) => p.id === (appraisal?.managerId || person.manager_id));
  return {
    name: `${u.firstName || person.first_name || ''} ${u.lastName || person.last_name || ''}`.trim() || u.email,
    photo: u.profilePhoto || null,
    employeeCode: u.employeeId || person.employee_code,
    designation: person.designation || u.department || null,
    department: u.department || person.department || null,
    hireDate: '2024-01-12',
    managerName: manager ? manager.name : null,
    cycleName: cycle?.name || null,
    reviewPeriodStart: cycle?.startDate || null,
    reviewPeriodEnd: cycle?.endDate || null,
    dueDate: cycle?.endDate || null,
    daysRemaining: null,
    status: appraisal?.status || 'not_started',
    ...extra,
  };
}

function snakeNotification(note) {
  return {
    id: note.id,
    title: note.title,
    message: note.message,
    link: note.link,
    is_read: note.isRead,
    created_at: note.createdAt,
  };
}

function dashboardEmployee() {
  const state = getAppraisalState();
  const user = actor();
  const cycle = getOpenCycle(state);
  const appraisal = cycle
    ? state.appraisals.find((item) => item.employeeId === user.employeeId && item.cycleId === cycle.id)
    : state.appraisals.find((item) => item.employeeId === user.employeeId);
  const goals = listGoalsForEmployee(user.employeeId, state, cycle?.id);
  const manager = PEOPLE.find((item) => item.id === (appraisal?.managerId || 'MGR001'));
  const notifications = listNotificationsForRecipient(user.employeeId, state).map(snakeNotification);
  return {
    profileBanner: profileBanner(),
    goals: goals.map((goal) => snakeGoal(goal, state)),
    goalProgress: goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0,
    workflowProgress: buildWorkflow(appraisal?.status || (cycle ? 'draft' : 'not_started'), 'employee'),
    appraisalStatus: appraisal && { ...appraisal, self_rating: appraisal.selfRating, status: appraisal.status },
    manager: manager && { ...manager, profile_photo: null },
    upcomingReviews: cycle
      ? [{ name: cycle.name, end_date: cycle.endDate, status: appraisal?.status || 'not_started' }]
      : [],
    notifications,
  };
}

function dashboardManager() {
  const user = actor();
  const pending = listManagerPending(user.employeeId);
  const completed = listManagerCompleted(user.employeeId);
  const ratings = completed.map((a) => getAppraisalState().managerReviews.find((r) => r.appraisalId === a.id)?.overallRating).filter(Boolean);
  return {
    profileBanner: profileBanner(),
    workflowProgress: buildWorkflow(pending.length ? 'under_manager_review' : completed.length ? 'completed' : 'draft', 'manager'),
    teamCount: PEOPLE.filter((p) => p.manager_id === user.employeeId).length,
    pendingCount: pending.length,
    completedCount: completed.length,
    averageRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    ratingDistribution: { outstanding: 0, exceeds: ratings.length, meets: 1, needs: 0, unsatisfactory: 0 },
    teamPerformance: PEOPLE.filter((p) => p.manager_id === user.employeeId).map((p) => ({
      name: p.name,
      avg_progress: Math.round((listGoalsForEmployee(p.id).reduce((s, g) => s + g.progress, 0) / (listGoalsForEmployee(p.id).length || 1))),
      avg_rating: 4,
    })),
    pendingReviews: reviewRows(pending),
  };
}

function bandCounts(ratings) {
  const buckets = { outstanding: 0, exceeds: 0, meets: 0, needs: 0, unsatisfactory: 0 };
  ratings.forEach((value) => {
    if (value >= 4.5) buckets.outstanding += 1;
    else if (value >= 3.5) buckets.exceeds += 1;
    else if (value >= 2.5) buckets.meets += 1;
    else if (value >= 1.5) buckets.needs += 1;
    else buckets.unsatisfactory += 1;
  });
  return buckets;
}

function dashboardHr() {
  const state = getAppraisalState();
  const cycle = getOpenCycle(state);
  const appraisals = cycle
    ? state.appraisals.filter((a) => a.cycleId === cycle.id)
    : state.appraisals;
  const completed = appraisals.filter((a) => a.status === 'completed');
  const selfPending = appraisals.filter((a) => ['draft', 'returned'].includes(a.status)).length;
  const managerPending = appraisals.filter((a) => a.status === 'under_manager_review').length;
  const adminPending = appraisals.filter((a) => a.status === 'under_admin_review').length;
  const leadershipPending = appraisals.filter((a) => a.status === 'under_leadership_review').length;
  const ratings = appraisals
    .map((a) => {
      const leadership = state.leadershipReviews.find((r) => r.appraisalId === a.id);
      const admin = state.adminReviews.find((r) => r.appraisalId === a.id);
      const manager = state.managerReviews.find((r) => r.appraisalId === a.id);
      return leadership?.finalRating ?? admin?.finalRating ?? manager?.overallRating ?? a.selfRating;
    })
    .filter((value) => value != null)
    .map(Number);

  const byDept = {};
  appraisals.forEach((a) => {
    const rating = ratings.length
      ? (state.leadershipReviews.find((r) => r.appraisalId === a.id)?.finalRating
        ?? state.adminReviews.find((r) => r.appraisalId === a.id)?.finalRating
        ?? state.managerReviews.find((r) => r.appraisalId === a.id)?.overallRating
        ?? a.selfRating)
      : null;
    if (!byDept[a.department]) byDept[a.department] = { sum: 0, count: 0 };
    if (rating != null) {
      byDept[a.department].sum += Number(rating);
      byDept[a.department].count += 1;
    }
  });

  return {
    profileBanner: profileBanner(),
    workflowProgress: buildWorkflow(
      completed.length
        ? 'completed'
        : leadershipPending
          ? 'under_leadership_review'
          : adminPending
            ? 'under_admin_review'
            : managerPending
              ? 'under_manager_review'
              : 'draft',
      'hr',
    ),
    total_employees: PEOPLE.filter((p) => p.id.startsWith('EMP')).length,
    total_managers: 1,
    total_departments: DEPARTMENTS.length,
    pending_approvals: appraisals.filter((a) => !['draft', 'completed', 'returned'].includes(a.status)).length,
    completed_appraisals: completed.length,
    active_cycles: state.cycles.filter((c) => c.status === 'open').length,
    stageCounts: {
      self_pending: selfPending,
      manager_pending: managerPending,
      admin_pending: adminPending,
      leadership_pending: leadershipPending,
      completed: completed.length,
    },
    pipeline: reviewRows(appraisals),
    ratingDistribution: bandCounts(ratings),
    departmentPerformance: Object.entries(byDept).map(([department, stats]) => ({
      department,
      avg_rating: stats.count ? Number((stats.sum / stats.count).toFixed(1)) : 0,
    })),
    monthlyAppraisals: [
      { month: 'Open', count: selfPending },
      { month: 'Manager', count: managerPending },
      { month: 'Admin', count: adminPending },
      { month: 'CEO', count: leadershipPending },
      { month: 'Done', count: completed.length },
    ],
    topPerformers: completed
      .map((a) => {
        const rating = state.leadershipReviews.find((r) => r.appraisalId === a.id)?.finalRating
          ?? state.adminReviews.find((r) => r.appraisalId === a.id)?.finalRating
          ?? a.selfRating;
        return {
          name: a.employeeName,
          designation: a.designation,
          department: a.department,
          rating,
        };
      })
      .filter((row) => row.rating != null)
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 5),
  };
}

function dashboardQueue(kind) {
  const state = getAppraisalState();
  const queue = kind === 'admin' ? listAdminQueue(state) : listLeadershipQueue(state);
  const completed = state.appraisals.filter((a) => a.status === 'completed');
  const reviews = kind === 'admin' ? state.adminReviews : state.leadershipReviews;
  return {
    profileBanner: profileBanner(),
    workflowProgress: buildWorkflow(queue.length ? (kind === 'admin' ? 'under_admin_review' : 'under_leadership_review') : completed.length ? 'completed' : 'draft', kind),
    pendingCount: queue.length,
    completedCount: completed.length,
    highPotentialCount: reviews.filter((r) => r.highPotential).length,
    promoCount: reviews.filter((r) => r.recommendPromotion).length,
    queue: reviewRows(queue),
  };
}

function normaliseRatings(items, type) {
  return (items || []).map((item) => ({
    referenceId: String(item.competency_id ?? item.goal_id ?? item.reference_id),
    score: Number(item.score),
    comments: item.comments || undefined,
    type,
  }));
}

function stagePayload(payload) {
  return {
    comments: payload.comments || '',
    developmentPlan: payload.development_plan || '',
    strengths: payload.strengths || '',
    improvements: payload.improvements || '',
    recommendPromotion: !!payload.recommend_promotion,
    recommendIncrement: !!payload.recommend_increment,
    salaryRevision: payload.salary_revision || '',
    roleChange: payload.role_change || '',
    training: payload.recommended_training || payload.training || '',
    highPotential: !!payload.high_potential,
    finalRating: payload.final_rating === '' || payload.final_rating == null ? null : Number(payload.final_rating),
    submit: !!payload.submit,
  };
}

export const dashboardApi = {
  employee: () => ok(dashboardEmployee()),
  manager: () => ok(dashboardManager()),
  hr: () => ok(dashboardHr()),
  leadership: () => ok(dashboardQueue('leadership')),
  admin: () => ok(dashboardQueue('admin')),
};

export const appraisalApi = {
  cycles: () => { const state = getAppraisalState(); return ok(state.cycles.map((cycle) => snakeCycle(cycle, state))); },
  createCycle: (payload) => wrap(() => {
    const cycle = { id: `cycle-${Date.now()}`, name: payload.name, description: payload.description || '', startDate: payload.start_date, endDate: payload.end_date, status: 'draft' };
    upsertCycle(cycle); return ok(snakeCycle(cycle, getAppraisalState()), 'Cycle created');
  }),
  updateCycle: (id, payload) => wrap(() => {
    if (payload.status === 'open') {
      const state = openAppraisalCycle(id, DEMO_EMPLOYEES);
      const cycle = state.cycles.find((c) => c.id === id);
      return ok(snakeCycle(cycle, state), 'Cycle opened — employees notified');
    }
    const state = getAppraisalState();
    const current = state.cycles.find((c) => c.id === id);
    if (!current) throw new Error('Cycle not found.');
    const cycle = {
      ...current,
      ...payload,
      startDate: payload.start_date || current.startDate,
      endDate: payload.end_date || current.endDate,
      status: payload.status || current.status,
    };
    upsertCycle(cycle);
    return ok(snakeCycle(cycle, getAppraisalState()), 'Cycle updated');
  }),
  competencies: () => ok(getAppraisalState().competencies.map((c) => ({ ...c, is_leadership_only: c.isLeadershipOnly }))),
  my: () => wrap(() => {
    const state = getAppraisalState();
    const cycle = getOpenCycle(state);
    if (!cycle) {
      return ok({
        appraisal: null,
        ratings: [],
        documents: [],
        goals: [],
        cycle: null,
      });
    }
    const current = getOrCreateSelfAppraisal(storeActor(), state);
    const latest = getAppraisalState();
    const appraisal = current.appraisal
      || latest.appraisals.find((item) => item.employeeId === actor().employeeId && item.cycleId === cycle.id)
      || null;
    const bundle = appraisal ? bundleFor(appraisal.id) : null;
    const goals = (bundle?.goals && bundle.goals.length)
      ? bundle.goals
      : listGoalsForEmployee(actor().employeeId, latest, cycle.id).map((g) => snakeGoal(g, latest));
    return ok({
      appraisal: bundle?.appraisal || (appraisal ? {
        ...appraisal,
        self_feedback: appraisal.selfFeedback,
        self_rating: appraisal.selfRating,
        employee_name: appraisal.employeeName,
        employee_code: appraisal.employeeId,
        department_name: appraisal.department,
        cycle_name: cycle.name,
      } : null),
      ratings: bundle?.ratings || [],
      documents: [],
      goals,
      cycle: snakeCycle(cycle, latest),
    });
  }),
  saveMy: (payload) => wrap(() => {
    const appraisal = persistSelfAppraisal(storeActor(), {
      achievements: payload.achievements || '', challenges: payload.challenges || '', selfFeedback: payload.self_feedback || '',
      selfRating: payload.self_rating == null ? null : Number(payload.self_rating),
      competencyRatings: normaliseRatings(payload.competency_ratings, 'competency'),
      goalRatings: normaliseRatings(payload.goal_ratings, 'goal'), submit: !!payload.submit,
    });
    return ok({ id: appraisal.id }, payload.submit ? 'Self appraisal submitted' : 'Self appraisal saved');
  }),
  history: () => ok(getAppraisalState().appraisals.filter((a) => a.employeeId === actor().employeeId).map((a) => reviewRows([a])[0])),
  feedback: () => {
    const state = getAppraisalState();
    return ok(state.managerReviews.filter((r) => state.appraisals.some((a) => a.id === r.appraisalId && a.employeeId === actor().employeeId)).map((r) => ({ cycle_name: getOpenCycle(state)?.name, manager_comments: r.comments, manager_rating: r.overallRating, final_rating: state.leadershipReviews.find((x) => x.appraisalId === r.appraisalId)?.finalRating })));
  },
  get: (id) => ok(bundleFor(id)),
  pendingReviews: () => ok(reviewRows(listManagerPending(actor().employeeId))),
  completedReviews: () => ok(reviewRows(listManagerCompleted(actor().employeeId))),
  saveManagerReview: (id, payload) => wrap(() => {
    const result = persistManagerReview(storeActor(), id, {
      comments: payload.comments || '', developmentPlan: payload.development_plan || '', trainingRecommendation: payload.recommend_training || '',
      recommendPromotion: !!payload.recommend_promotion, recommendIncrement: !!payload.recommend_increment,
      competencyRatings: normaliseRatings(payload.competency_ratings, 'competency'), goalRatings: normaliseRatings(payload.goal_ratings, 'goal'), submit: !!payload.submit,
    });
    return ok(result, payload.submit ? 'Manager review submitted' : 'Manager review saved');
  }),
  approvals: () => {
    const rows = reviewRows(listAdminQueue());
    return Promise.resolve({ data: { success: true, data: rows, pagination: { total: rows.length }, total: rows.length } });
  },
  hrReview: (id, payload) => appraisalApi.saveAdminReview(id, payload),
  leadershipQueue: (params = {}) => {
    const state = getAppraisalState();
    let rows = params.status === 'completed'
      ? reviewRows(state.appraisals.filter((a) => a.status === 'completed'))
      : reviewRows(listLeadershipQueue(state));
    if (params.search) {
      const q = String(params.search).toLowerCase();
      rows = rows.filter((row) => `${row.employee_name} ${row.employee_code}`.toLowerCase().includes(q));
    }
    return Promise.resolve({ data: { success: true, data: rows, pagination: { total: rows.length }, total: rows.length } });
  },
  leadershipReview: (id) => ok(bundleFor(id)),
  saveLeadershipReview: (id, payload) => wrap(() => ok(persistLeadershipReview(storeActor(), id, stagePayload(payload)), payload.submit ? 'Leadership review submitted' : 'Leadership review saved')),
  adminQueue: (params = {}) => {
    const state = getAppraisalState();
    let rows = params.status === 'completed'
      ? reviewRows(state.appraisals.filter((a) => ['under_leadership_review', 'completed'].includes(a.status)))
      : reviewRows(listAdminQueue(state));
    if (params.search) {
      const q = String(params.search).toLowerCase();
      rows = rows.filter((row) => `${row.employee_name} ${row.employee_code}`.toLowerCase().includes(q));
    }
    return Promise.resolve({ data: { success: true, data: rows, pagination: { total: rows.length }, total: rows.length } });
  },
  adminReview: (id) => ok(bundleFor(id)),
  saveAdminReview: (id, payload) => wrap(() => ok(persistAdminReview(storeActor(), id, stagePayload(payload)), payload.submit ? 'Admin review submitted' : 'Admin review saved')),
  /** Clears self-appraisal + manager/admin/leadership reviews back to blank demo seed. */
  resetDemo: () => ok(resetAppraisalState(), 'Appraisal demo reset for all roles'),
};

export const goalApi = {
  list: () => {
    const state = getAppraisalState();
    return ok(listGoalsForEmployee(actor().employeeId, state).map((g) => snakeGoal(g, state)));
  },
  create: (payload) => {
    const state = getAppraisalState(); const goal = { id: String(Date.now()), employeeId: payload.employee_id || actor().employeeId, managerId: actor().employeeId, cycleId: getOpenCycle(state)?.id, name: payload.goal_name || payload.name, description: payload.description || '', kpi: payload.kpi || '', weightage: Number(payload.weightage) || 0, target: payload.target || '', progress: 0, status: 'not_started', dueDate: payload.end_date || payload.due_date || '' };
    updateAppraisalState((s) => ({ ...s, goals: [...s.goals, goal] })); return ok(snakeGoal(goal), 'Goal created');
  },
  update: (id, payload) => {
    let updated; updateAppraisalState((state) => ({ ...state, goals: state.goals.map((g) => { if (g.id !== String(id)) return g; updated = { ...g, ...payload, progress: payload.progress == null ? g.progress : Number(payload.progress), status: Number(payload.progress) >= 100 ? 'completed' : g.status }; return updated; }) }));
    return ok(snakeGoal(updated), 'Goal updated');
  },
  remove: (id) => { updateAppraisalState((state) => ({ ...state, goals: state.goals.filter((g) => g.id !== String(id)) })); return ok(null, 'Goal removed'); },
};

export const notificationApi = {
  list: (params = {}) => {
    const user = actor();
    const notes = listNotificationsForRecipient(user.employeeId, getAppraisalState()).map(snakeNotification);
    const limit = Number(params.limit) || 20;
    const data = notes.slice(0, limit);
    return Promise.resolve({
      data: {
        success: true,
        data,
        unreadCount: notes.filter((n) => !n.is_read).length,
      },
    });
  },
  markRead: (id) => {
    markNotificationRead(id);
    return ok(null);
  },
  markAllRead: () => {
    markAllNotificationsRead(actor().employeeId);
    return ok(null);
  },
};

export const authApi = {
  login: async () => {
    const user = actor();
    return ok({ token: 'local-mock-token', user });
  },
  me: async () => {
    const user = actor();
    const person = PEOPLE.find((p) => p.id === user.employeeId) || {};
    return ok({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      first_name: user.firstName,
      last_name: user.lastName,
      profilePhoto: user.profilePhoto || null,
      profile_photo: user.profilePhoto || null,
      phone: person.phone || '',
      employeeId: user.employeeId,
      department: user.department || person.department,
      designation: person.designation || null,
    });
  },
};

export const profileApi = {
  update: (data) => ok(data, 'Profile updated'),
  uploadPhoto: () => ok({ profile_photo: null }),
  uploadDocument: () => ok({ id: `doc-${Date.now()}` }),
  deleteDocument: () => ok(null),
  activity: () => ok([]),
  search: () => ok({ employees: [], cycles: [] }),
};

function listResponse(items, params = {}) {
  const search = String(params.search || '').toLowerCase();
  const rows = search ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(search)) : items;
  return rows;
}

export const employeeApi = {
  list: (params) => {
    const user = actor();
    let people = PEOPLE.filter((p) => p.id.startsWith('EMP'));
    if (user.role === 'manager') {
      people = people.filter((p) => p.manager_id === user.employeeId);
    }
    const rows = listResponse(people, params);
    return Promise.resolve({ data: { success: true, data: rows, total: rows.length, pagination: { total: rows.length } } });
  },
  get: (id) => ok(PEOPLE.find((p) => p.id === id)),
  create: (data) => ok(data, 'Employee created'),
  update: (id, data) => ok({ id, ...data }, 'Employee updated'),
  deactivate: (id) => ok({ id }, 'Employee deactivated'),
};
export const managerApi = {
  list: (params) => {
    const rows = listResponse(PEOPLE.filter((p) => p.id === 'MGR001'), params);
    return Promise.resolve({ data: { success: true, data: rows, total: rows.length, pagination: { total: rows.length } } });
  },
  get: (id) => ok(PEOPLE.find((p) => p.id === id)),
  create: (data) => ok(data, 'Manager created'),
  update: (id, data) => ok({ id, ...data }, 'Manager updated'),
};
export const departmentApi = {
  list: (params) => {
    const rows = listResponse(DEPARTMENTS, params);
    return Promise.resolve({ data: { success: true, data: rows, total: rows.length, pagination: { total: rows.length } } });
  },
  create: (data) => ok({ id: `dept-${Date.now()}`, ...data }, 'Department created'),
  update: (id, data) => ok({ id, ...data }, 'Department updated'),
  remove: () => ok(null, 'Department removed'),
};
export const reportApi = {
  department: () => ok([{ department: 'Quality Assurance', average_rating: 4.2 }, { department: 'Engineering', average_rating: 3.9 }]),
  team: () => {
    const managerId = actor().employeeId;
    const teamAppraisals = getAppraisalState().appraisals.filter(
      (a) => a.managerId === managerId || PEOPLE.find((p) => p.id === a.employeeId)?.manager_id === managerId,
    );
    const rows = reviewRows(teamAppraisals).map((row) => ({
      ...row,
      name: row.employee_name,
      avg_progress: row.progress,
      avg_rating: row.rating ?? row.manager_rating ?? row.self_rating,
      appraisal_count: 1,
      appraisal_id: row.appraisal_id || row.id,
    }));
    return ok(rows);
  },
  ratingDistribution: () => ok({ outstanding: 1, exceeds: 2, meets: 1, needs: 0, unsatisfactory: 0 }),
  topPerformers: () => ok([{ name: 'Rajesh Kumar', rating: 4.2, department: 'Quality Assurance' }]),
  pending: () => ok(reviewRows(getAppraisalState().appraisals.filter((a) => a.status !== 'completed'))),
  completed: () => ok(reviewRows(getAppraisalState().appraisals.filter((a) => a.status === 'completed'))),
  appraisalProgress: (filters = {}) => {
    const state = getAppraisalState();
    const cycle = getOpenCycle(state);
    let rows = state.appraisals.map((appraisal) => {
      const manager = PEOPLE.find((p) => p.id === appraisal.managerId);
      const managerReview = state.managerReviews.find((r) => r.appraisalId === appraisal.id);
      const adminReview = state.adminReviews.find((r) => r.appraisalId === appraisal.id);
      const leadershipReview = state.leadershipReviews.find((r) => r.appraisalId === appraisal.id);
      const selfDone = ['under_manager_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(appraisal.status);
      const managerDone = managerReview?.status === 'submitted' || ['under_admin_review', 'under_leadership_review', 'completed'].includes(appraisal.status);
      const adminDone = adminReview?.status === 'submitted' || ['under_leadership_review', 'completed'].includes(appraisal.status);
      const leadershipDone = leadershipReview?.status === 'submitted' || appraisal.status === 'completed';
      const progress = appraisal.status === 'completed' ? 100 : appraisal.status === 'under_leadership_review' ? 85 : appraisal.status === 'under_admin_review' ? 65 : appraisal.status === 'under_manager_review' ? 40 : 15;
      return {
        id: appraisal.id,
        appraisal_id: appraisal.id,
        employee_code: appraisal.employeeId,
        employee_name: appraisal.employeeName,
        designation: appraisal.designation,
        department_name: appraisal.department,
        manager_name: manager?.name || 'Anita Desai',
        manager_id: appraisal.managerId,
        cycle_id: appraisal.cycleId,
        cycle_name: cycle?.name || 'H1 2026 Appraisal Cycle',
        status: appraisal.status,
        progress,
        self_done: selfDone,
        manager_done: managerDone,
        admin_done: adminDone,
        leadership_done: leadershipDone,
        overallRating: leadershipReview?.finalRating ?? adminReview?.finalRating ?? managerReview?.overallRating ?? appraisal.selfRating,
        profile_photo: null,
      };
    });

    if (filters.search) {
      const q = String(filters.search).toLowerCase();
      rows = rows.filter((row) => `${row.employee_name} ${row.employee_code}`.toLowerCase().includes(q));
    }
    if (filters.status) rows = rows.filter((row) => row.status === filters.status);
    if (filters.completion === 'completed') rows = rows.filter((row) => row.status === 'completed');
    if (filters.completion === 'in_progress') rows = rows.filter((row) => row.status !== 'completed' && row.status !== 'draft');
    if (filters.completion === 'not_started') rows = rows.filter((row) => row.status === 'draft' || row.status === 'not_started');
    if (filters.cycle_id) rows = rows.filter((row) => row.cycle_id === filters.cycle_id);
    if (filters.manager_id) rows = rows.filter((row) => row.manager_id === filters.manager_id);
    if (filters.department_id) {
      const dept = DEPARTMENTS.find((d) => d.id === filters.department_id);
      if (dept) rows = rows.filter((row) => row.department_name === dept.name);
    }

    const completed = rows.filter((row) => row.status === 'completed').length;
    const inProgress = rows.filter((row) => row.status !== 'completed' && row.status !== 'draft').length;
    const avg = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / rows.length) : 0;

    return Promise.resolve({
      data: {
        success: true,
        data: rows,
        summary: {
          total: rows.length,
          avg_progress: avg,
          in_progress: inProgress,
          completed,
        },
        filters: {
          departments: DEPARTMENTS.map((d) => ({ id: d.id, name: d.name })),
          managers: PEOPLE.filter((p) => p.id === 'MGR001').map((m) => ({ id: m.id, name: m.name })),
          cycles: state.cycles.map((c) => ({ id: c.id, name: c.name })),
        },
      },
    });
  },
  appraisalProgressDetail: (id) => ok(progressDetailFor(id)),
  exportExcel: () => Promise.resolve({ data: new Blob(['Appraisal progress export (mock)'], { type: 'text/plain' }) }),
  exportPdf: () => Promise.resolve({ data: new Blob(['Appraisal progress export (mock)'], { type: 'text/plain' }) }),
  exportAppraisalPdf: () => Promise.resolve({ data: new Blob(['Appraisal PDF (mock)'], { type: 'text/plain' }) }),
  exportProgressExcel: () => Promise.resolve({ data: new Blob(['Appraisal progress export (mock)'], { type: 'text/plain' }) }),
  exportProgressPdf: () => Promise.resolve({ data: new Blob(['Appraisal progress export (mock)'], { type: 'text/plain' }) }),
};

