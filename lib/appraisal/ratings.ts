import type { ScoreEntry } from '@/lib/appraisal/types';
import { getPerformanceSettings } from '@/lib/settings/registry';

export function ratingLabel(score: number | null | undefined) {
  if (score == null || Number.isNaN(Number(score))) return 'Not rated';
  const s = Number(score);
  if (s >= 4.5) return 'Outstanding';
  if (s >= 3.5) return 'Exceeds Expectations';
  if (s >= 2.5) return 'Meets Expectations';
  if (s >= 1.5) return 'Needs Improvement';
  return 'Unsatisfactory';
}

export function calcCompetencyScore(ratings: ScoreEntry[]) {
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, item) => acc + Number(item.score || 0), 0);
  return Math.round((sum / ratings.length) * 100) / 100;
}

export function calcGoalScore(
  ratings: ScoreEntry[],
  goals: Array<{ id: string; weightage: number }>,
) {
  if (!ratings.length || !goals.length) return null;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const goal of goals) {
    const rating = ratings.find((item) => item.referenceId === goal.id);
    if (!rating) continue;
    const weight = Number(goal.weightage) || 0;
    weightedSum += Number(rating.score) * weight;
    totalWeight += weight;
  }
  if (!totalWeight) return null;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

export function calcOverallRating(
  goalScore: number | null,
  competencyScore: number | null,
  weights?: { goalWeight?: number; competencyWeight?: number },
) {
  if (goalScore == null && competencyScore == null) return null;
  if (goalScore == null) return competencyScore;
  if (competencyScore == null) return goalScore;

  const perf = typeof window !== 'undefined' ? getPerformanceSettings() : { goalWeight: 60, competencyWeight: 40 };
  const goalWeight = weights?.goalWeight ?? perf.goalWeight ?? 60;
  const competencyWeight = weights?.competencyWeight ?? perf.competencyWeight ?? 40;
  const gw = Number(goalWeight) / 100;
  const cw = Number(competencyWeight) / 100;
  const total = gw + cw || 1;
  return Math.round(((goalScore * gw + competencyScore * cw) / total) * 100) / 100;
}
