const ENROLLMENT_KEY = 'hrms-learning-enrollments';

export function getEnrolledCourseIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ENROLLMENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as number[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setEnrolledCourseIds(ids: number[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(ids));
}

export function toggleCourseEnrollment(courseId: number): boolean {
  const current = getEnrolledCourseIds();
  const next = current.includes(courseId)
    ? current.filter((id) => id !== courseId)
    : [...current, courseId];
  setEnrolledCourseIds(next);
  return next.includes(courseId);
}

export function isCourseEnrolled(courseId: number) {
  return getEnrolledCourseIds().includes(courseId);
}

/** Quiz attempts require enrollment in the linked course. */
export function canAttemptQuiz(courseId: number) {
  return isCourseEnrolled(courseId);
}
