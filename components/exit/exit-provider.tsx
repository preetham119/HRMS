'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import type { ExitCase, ExitNotification } from '@/lib/exit/types';
import { getStageAccess } from '@/lib/exit/permissions';

interface ExitContextValue {
  loading: boolean;
  error: string;
  message: string;
  exitCase: ExitCase | null;
  cases: ExitCase[];
  notifications: ExitNotification[];
  stageAccess: ReturnType<typeof getStageAccess>;
  refresh: () => Promise<void>;
  runAction: (payload: Record<string, unknown>) => Promise<ExitCase | null>;
  selectCase: (id: string) => void;
  setMessage: (value: string) => void;
  setError: (value: string) => void;
  clearFeedback: () => void;
}

const ExitContext = createContext<ExitContextValue | undefined>(undefined);

function pickDefaultCase(role: string | undefined, own: ExitCase | null, list: ExitCase[]): ExitCase | null {
  if (own && !['Completed', 'Cancelled'].includes(own.status)) {
    return own;
  }

  if (role === 'MANAGER' || role === 'HR' || role === 'ADMIN') {
    return (
      list.find((item) => item.status === 'Pending Approval' || item.status === 'Submitted') ||
      list.find((item) => item.withdrawalRequest?.status === 'Pending') ||
      list.find((item) => item.status === 'Rejected' || item.status === 'Revoked') ||
      list[0] ||
      own ||
      null
    );
  }

  if (role === 'FINANCE') {
    return (
      list.find((item) => item.status === 'Full & Final Pending' || item.status === 'Exit Interview Completed') ||
      list[0] ||
      null
    );
  }

  return own;
}

export function ExitProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [exitCase, setExitCase] = useState<ExitCase | null>(null);
  const [cases, setCases] = useState<ExitCase[]>([]);
  const [notifications, setNotifications] = useState<ExitNotification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const actorHeaders = useMemo(() => {
    if (!user) return {} as Record<string, string>;
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token ?? '',
      'x-employee-id': user.employeeId,
      'x-user-name': user.name ?? user.email,
    };
  }, [token, user]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/exit', {
        headers: actorHeaders,
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load exit data');

      const list: ExitCase[] = data.cases ?? [];
      const own: ExitCase | null = data.exitCase ?? null;
      setCases(list);
      setNotifications(data.notifications ?? []);

      setExitCase((current) => {
        if (selectedId) {
          return list.find((item) => item.id === selectedId) || own || pickDefaultCase(user.role, own, list);
        }
        if (current?.id) {
          const stillThere = list.find((item) => item.id === current.id) || (own?.id === current.id ? own : null);
          if (stillThere) return stillThere;
        }
        return pickDefaultCase(user.role, own, list);
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exit data');
    } finally {
      setLoading(false);
    }
  }, [actorHeaders, selectedId, user]);

  useEffect(() => {
    if (!isReady || !user) return;
    void refresh();
  }, [isReady, user, refresh]);

  const selectCase = useCallback(
    (id: string) => {
      setSelectedId(id);
      const found = cases.find((item) => item.id === id) ?? null;
      if (found) setExitCase(found);
    },
    [cases],
  );

  const runAction = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!user) return null;
      setError('');
      setMessage('');
      const response = await fetch('/api/exit', {
        method: 'POST',
        headers: actorHeaders,
        body: JSON.stringify({
          ...payload,
          actorId: user.id,
          actorEmail: user.email,
          actorName: user.name ?? user.email,
          actorRole: user.role,
          actorEmployeeId: user.employeeId,
          department: user.department,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }
      if (data.exitCase?.id) {
        setSelectedId(data.exitCase.id);
        setExitCase(data.exitCase);
      }
      setMessage(data.message ?? 'Updated successfully');
      await refresh();
      return (data.exitCase as ExitCase) ?? null;
    },
    [actorHeaders, refresh, user],
  );

  const clearFeedback = useCallback(() => {
    setError('');
    setMessage('');
  }, []);

  const value = useMemo<ExitContextValue>(
    () => ({
      loading,
      error,
      message,
      exitCase,
      cases,
      notifications,
      stageAccess: getStageAccess(exitCase),
      refresh,
      runAction,
      selectCase,
      setMessage,
      setError,
      clearFeedback,
    }),
    [loading, error, message, exitCase, cases, notifications, refresh, runAction, selectCase, clearFeedback],
  );

  return <ExitContext.Provider value={value}>{children}</ExitContext.Provider>;
}

export function useExit() {
  const context = useContext(ExitContext);
  if (!context) {
    throw new Error('useExit must be used within ExitProvider');
  }
  return context;
}
