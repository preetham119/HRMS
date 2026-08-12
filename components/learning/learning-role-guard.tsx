'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import {
  canAccessLearningAdmin,
  canAccessTrainerWorkspace,
} from '@/lib/learning/permissions';

type GuardMode = 'trainer' | 'admin';

/** Client-side role gate mirroring empL&D ProtectedRoute. */
export function LearningRoleGuard({
  mode,
  children,
}: {
  mode: GuardMode;
  children: React.ReactNode;
}) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  const allowed =
    mode === 'trainer' ? canAccessTrainerWorkspace(user?.role) : canAccessLearningAdmin(user?.role);

  useEffect(() => {
    if (!isReady) return;
    if (!user || !allowed) {
      router.replace('/learning?unauthorized=1');
    }
  }, [allowed, isReady, router, user]);

  if (!isReady || !user || !allowed) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
