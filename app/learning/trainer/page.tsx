'use client';

import { LearningRoleGuard } from '@/components/learning/learning-role-guard';
import TrainerWorkspace from '@/components/learning/trainer-workspace';

export default function LearningTrainerPage() {
  return (
    <LearningRoleGuard mode="trainer">
      <TrainerWorkspace />
    </LearningRoleGuard>
  );
}
