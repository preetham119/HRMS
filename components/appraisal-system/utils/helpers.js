export const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_manager_review: 'Manager Review',
  under_hr_review: 'Admin Review',
  under_leadership_review: 'CEO / Leadership Review',
  under_admin_review: 'Admin Review',
  completed: 'Completed',
  returned: 'Returned for Correction',
  not_started: 'Not Started',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
  in_progress: 'In Progress',
  overdue: 'Overdue',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
  pending: 'Pending',
};

export const STATUS_COLORS = {
  draft: 'default',
  submitted: 'info',
  under_manager_review: 'warning',
  under_hr_review: 'secondary',
  under_leadership_review: 'info',
  under_admin_review: 'secondary',
  completed: 'success',
  returned: 'error',
  not_started: 'default',
  open: 'success',
  closed: 'default',
  archived: 'default',
  in_progress: 'info',
  overdue: 'error',
  approved: 'success',
  rejected: 'error',
  published: 'success',
  pending: 'warning',
};

export const RATING_SCALE = [
  { value: 5, label: 'Outstanding', stars: '★★★★★' },
  { value: 4, label: 'Exceeds Expectations', stars: '★★★★☆' },
  { value: 3, label: 'Meets Expectations', stars: '★★★☆☆' },
  { value: 2, label: 'Needs Improvement', stars: '★★☆☆☆' },
  { value: 1, label: 'Unsatisfactory', stars: '★☆☆☆☆' },
];

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const ratingLabel = (score) => {
  const s = Number(score);
  if (!s && s !== 0) return '—';
  if (s >= 4.5) return 'Outstanding';
  if (s >= 3.5) return 'Exceeds Expectations';
  if (s >= 2.5) return 'Meets Expectations';
  if (s >= 1.5) return 'Needs Improvement';
  if (s > 0) return 'Unsatisfactory';
  return '—';
};

/** MUI Chip color for performance bands */
export const ratingBadgeColor = (score) => {
  const s = Number(score);
  if (s >= 4.5) return 'success';
  if (s >= 3.5) return 'primary';
  if (s >= 2.5) return 'info';
  if (s >= 1.5) return 'warning';
  if (s > 0) return 'error';
  return 'default';
};

export const formatStars = (score) => {
  const s = Math.round(Number(score) || 0);
  return '★'.repeat(Math.min(5, Math.max(0, s))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(0, s))));
};

export const averageRating = (values) => {
  const nums = (values || []).map(Number).filter((v) => v > 0);
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
};

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

/** Simulate staged progress 0→100 during login init */
export const runLoginProgress = async (onProgress, tasks = []) => {
  const stages = tasks.length
    ? tasks
    : [
        async () => {},
        async () => {},
        async () => {},
        async () => {},
      ];
  const step = 100 / stages.length;
  let progress = 0;
  onProgress(5);
  for (let i = 0; i < stages.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await stages[i]();
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 280 + Math.random() * 220));
    progress = Math.min(98, Math.round((i + 1) * step));
    onProgress(progress);
  }
  onProgress(100);
  await new Promise((r) => setTimeout(r, 350));
};
