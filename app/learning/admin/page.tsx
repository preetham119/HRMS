'use client';

import { LearningRoleGuard } from '@/components/learning/learning-role-guard';
import HrConsole from '@/components/learning/hr-console';

export default function LearningAdminPage() {
  return (
    <LearningRoleGuard mode="admin">
      <HrConsole />
    </LearningRoleGuard>
  );
}
