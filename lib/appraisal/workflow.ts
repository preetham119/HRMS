type Step = { id: string; label: string; done: boolean };

function buildProgress(steps: Step[], nextAction: string, actionLink: string | null = null, actionLabel: string | null = null) {
  const completedSteps = steps.filter((step) => step.done).length;
  const currentIndex = steps.findIndex((step) => !step.done);
  const allDone = currentIndex === -1;
  const current = allDone ? null : steps[currentIndex];

  return {
    percent: allDone ? 100 : Math.round((completedSteps / steps.length) * 100),
    completedSteps,
    totalSteps: steps.length,
    remaining: allDone ? 0 : steps.length - completedSteps,
    currentStepIndex: allDone ? steps.length - 1 : currentIndex,
    currentStepId: current?.id ?? null,
    currentStepLabel: current?.label ?? null,
    nextAction: allDone ? 'All steps complete. No further action needed.' : nextAction,
    actionLink: allDone ? null : actionLink,
    actionLabel: allDone ? null : actionLabel,
    steps: steps.map((step, index) => ({
      ...step,
      status: step.done ? 'completed' : index === currentIndex ? 'active' : 'pending',
      number: index + 1,
    })),
  };
}

export function buildEmployeeProgress({ cycle, appraisalStatus, goals = [] }: { cycle: unknown; appraisalStatus?: { status?: string } | null; goals?: unknown[] }) {
  const status = appraisalStatus?.status || 'not_started';
  const hasGoals = goals.length > 0;
  const selfStarted = ['draft', 'returned', 'submitted', 'under_manager_review', 'under_hr_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(status);
  const selfDone = ['submitted', 'under_manager_review', 'under_hr_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(status);
  const managerDone = ['under_hr_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(status);
  const adminDone = ['under_leadership_review', 'completed'].includes(status);
  const leadershipDone = status === 'completed';
  const steps = [
    { id: 'goals', label: 'Set Goals', done: Boolean(cycle) && hasGoals },
    { id: 'self', label: 'Self Assessment', done: selfDone },
    { id: 'manager', label: 'Manager Review', done: managerDone },
    { id: 'admin', label: 'Admin', done: adminDone },
    { id: 'leadership', label: 'Leadership', done: leadershipDone },
  ];
  let nextAction = 'All steps complete. No further action needed.';
  let actionLink: string | null = null;
  let actionLabel: string | null = null;
  if (!cycle) nextAction = 'Wait for an open appraisal cycle to begin.';
  else if (!hasGoals) [nextAction, actionLink, actionLabel] = ['Review your goals, then start your self-assessment.', '/employee/goals', 'View Goals'];
  else if (!selfStarted || status === 'not_started') [nextAction, actionLink, actionLabel] = ['Start your self-assessment for the current cycle.', '/employee/self-appraisal', 'Start Self Appraisal'];
  else if (status === 'draft' || status === 'returned') [nextAction, actionLink, actionLabel] = [status === 'returned' ? 'Your appraisal was returned. Revise and submit your self-assessment.' : 'Complete and submit your self-assessment.', '/employee/self-appraisal', 'Submit Self Appraisal'];
  else if (!managerDone) [nextAction, actionLink, actionLabel] = ['Manager review is in progress. You will be notified once it is complete.', '/employee/appraisal-history', 'View Status'];
  else if (!adminDone) [nextAction, actionLink, actionLabel] = ['Awaiting Admin review.', '/employee/appraisal-history', 'View Status'];
  else if (!leadershipDone) [nextAction, actionLink, actionLabel] = ['Awaiting Leadership final approval.', '/employee/appraisal-history', 'View Status'];
  else [actionLink, actionLabel] = ['/employee/feedback', 'View Feedback'];
  return buildProgress(steps, nextAction, actionLink, actionLabel);
}

export function buildManagerProgress({ teamCount = 0, pendingCount = 0, awaitingSelf = 0, withHrCount = 0, finalizedCount = 0 }: Record<string, number>) {
  const submittedTotal = pendingCount + withHrCount + finalizedCount;
  const teamSelfDone = teamCount > 0 && awaitingSelf === 0 && submittedTotal > 0;
  const reviewsDone = teamCount > 0 && teamSelfDone && pendingCount === 0 && submittedTotal > 0;
  const finalizeDone = teamCount > 0 && finalizedCount >= teamCount && pendingCount === 0;
  const progress = buildProgress([
    { id: 'team_goals', label: 'Team Goal Setting', done: teamCount > 0 },
    { id: 'team_self', label: 'Team Self Assessment', done: teamSelfDone || finalizeDone },
    { id: 'review', label: 'Review Assessments', done: reviewsDone || finalizeDone },
    { id: 'feedback', label: 'Provide Feedback', done: (reviewsDone && withHrCount + finalizedCount > 0) || finalizeDone },
    { id: 'finalize', label: 'Finalize Review', done: finalizeDone },
  ], pendingCount ? `Review your team self-assessments. ${pendingCount} awaiting your review.` : 'Track remaining appraisals until finalization.', pendingCount ? '/manager/pending-reviews' : '/manager/completed-reviews', pendingCount ? 'Review Now' : 'Track Reviews');
  if (submittedTotal) progress.percent = finalizeDone ? 100 : Math.min(100, Math.round(progress.percent * 0.7 + Math.round(((withHrCount + finalizedCount) / submittedTotal) * 100) * 0.3));
  return { ...progress, meta: { teamCount, pendingCount, awaitingSelf, withHrCount, finalizedCount } };
}

export function buildHrProgress({ activeCycles = 0, totalEmployees = 0, totalManagers = 0, totalDepartments = 0, draftCount = 0, managerReviewCount = 0, pendingApprovals = 0, completedAppraisals = 0, returnedCount = 0 }: Record<string, number>) {
  const pipeline = draftCount + managerReviewCount + pendingApprovals + completedAppraisals + returnedCount;
  const setupDone = activeCycles > 0;
  const monitorDone = setupDone && totalEmployees > 0 && totalManagers > 0 && totalDepartments > 0 && pipeline > 0;
  const publishDone = completedAppraisals > 0 && !pendingApprovals && !managerReviewCount && !draftCount;
  const progress = buildProgress([
    { id: 'setup', label: 'Open Appraisal Cycle', done: setupDone },
    { id: 'reports', label: 'View Reports', done: monitorDone || publishDone },
    { id: 'send', label: 'Send to Admin', done: publishDone },
  ], pendingApprovals ? `Approve and send ${pendingApprovals} appraisal${pendingApprovals > 1 ? 's' : ''} to Admin.` : 'Monitor reports while teams complete appraisals.', pendingApprovals ? '/hr/approvals' : '/hr/reports', pendingApprovals ? 'Go to Approvals' : 'View Reports');
  if (pipeline) progress.percent = publishDone ? 100 : Math.min(100, Math.round(progress.percent * 0.5 + Math.round((completedAppraisals / pipeline) * 100) * 0.5));
  return { ...progress, meta: { draftCount, managerReviewCount, pendingApprovals, completedAppraisals, returnedCount, pipeline } };
}

export function buildAdminProgress({ activeCycles = 0, pendingCount = 0, completedCount = 0, inFlightCount = 0 }: Record<string, number>) {
  const intake = pendingCount + completedCount > 0 || inFlightCount > 0;
  const finalized = !pendingCount && completedCount > 0 && !inFlightCount;
  const progress = buildProgress([
    { id: 'cycle', label: 'Cycle Open', done: activeCycles > 0 },
    { id: 'intake', label: 'Reviews Received', done: intake },
    { id: 'recommend', label: 'Admin Review', done: completedCount > 0 },
    { id: 'final', label: 'Team Finalized', done: finalized },
  ], pendingCount ? `Complete ${pendingCount} pending admin review${pendingCount > 1 ? 's' : ''}.` : 'Waiting for managers to complete team reviews.', '/admin/approvals', 'Review Now');
  if (pendingCount + completedCount) progress.percent = finalized ? 100 : Math.min(100, Math.round(progress.percent * 0.55 + Math.round((completedCount / Math.max(pendingCount + completedCount, 1)) * 100) * 0.45));
  return { ...progress, meta: { pendingCount, completedCount, inFlightCount } };
}

export function buildLeadershipProgress({ activeCycles = 0, pendingCount = 0, completedCount = 0, inFlightCount = 0 }: Record<string, number>) {
  const intake = pendingCount + completedCount > 0 || inFlightCount > 0;
  const finalized = !pendingCount && completedCount > 0 && !inFlightCount;
  const progress = buildProgress([
    { id: 'cycle', label: 'Cycle Open', done: activeCycles > 0 },
    { id: 'intake', label: 'Reviews Received', done: intake },
    { id: 'recommend', label: 'Recommendations', done: completedCount > 0 },
    { id: 'final', label: 'Team Finalized', done: finalized },
  ], pendingCount ? `Complete ${pendingCount} pending leadership approval${pendingCount > 1 ? 's' : ''}.` : 'Waiting for Admin to send appraisals for leadership approval.', '/leadership/approvals', 'Review Now');
  if (pendingCount + completedCount) progress.percent = finalized ? 100 : Math.min(100, Math.round(progress.percent * 0.55 + Math.round((completedCount / Math.max(pendingCount + completedCount, 1)) * 100) * 0.45));
  return { ...progress, meta: { pendingCount, completedCount, inFlightCount } };
}

export function computeEmployeeAppraisalProgress({ status = 'not_started', submitted_at = null, manager_review_status = null, hr_status = null, hr_final_rating = null, leadership_status = null, admin_status = null }: Record<string, string | number | null> = {}) {
  const selfDone = ['submitted', 'under_manager_review', 'under_hr_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(String(status)) || Boolean(submitted_at);
  const managerDone = manager_review_status === 'submitted' || ['under_hr_review', 'under_admin_review', 'under_leadership_review', 'completed'].includes(String(status));
  const adminDone = admin_status === 'submitted' || ['under_leadership_review', 'completed'].includes(String(status));
  const leadershipDone = leadership_status === 'submitted' || status === 'completed';
  const finalDone = ['approved', 'published'].includes(String(hr_status)) || ['under_admin_review', 'under_leadership_review', 'completed'].includes(String(status)) || hr_final_rating != null;
  const stages = [{ id: 'self', label: 'Self Evaluation', done: selfDone }, { id: 'manager', label: 'Manager Review', done: managerDone }, { id: 'admin', label: 'Admin Review', done: adminDone }, { id: 'leadership', label: 'Leadership Review', done: leadershipDone }];
  const completedSteps = stages.filter((stage) => stage.done).length;
  return { stages, completedSteps, totalSteps: stages.length, progress: Math.round((completedSteps / stages.length) * 100), self_done: selfDone, manager_done: managerDone, final_done: finalDone, admin_done: adminDone, leadership_done: leadershipDone };
}
