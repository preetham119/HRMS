'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import AppraisalApp from '@/components/appraisal-system/AppraisalApp';
import { useAuth } from '@/components/providers/auth-provider';

type AppraisalRole = 'employee' | 'manager' | 'hr' | 'admin' | 'leadership';

declare global {
  interface Window {
    __HRMS_APPRAISAL_USER__?: Record<string, unknown>;
    __HRMS_APPRAISAL_LOGOUT__?: () => void;
  }
}

function mapRole(role: string | undefined): AppraisalRole {
  if (role === 'MANAGER') return 'manager';
  if (role === 'HR') return 'hr';
  if (role === 'ADMIN') return 'admin';
  if (role === 'CEO') return 'leadership';
  return 'employee';
}

export default function AppraisalPageClient() {
  const { user, logout, isReady } = useAuth();
  const router = useRouter();

  const appraisalUser = useMemo(() => {
    if (!user) return null;
    const parts = (user.name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || user.email.split('@')[0];
    const lastName = parts.slice(1).join(' ');
    return {
      id: user.id,
      email: user.email,
      role: mapRole(user.role),
      firstName,
      lastName,
      employeeId: user.employeeId,
      profileId: user.id,
      department: user.department,
      profilePhoto: user.profilePicture,
    };
  }, [user]);

  // Bridge auth into the appraisal module before children render (not only in effects),
  // so Self Appraisal / localBackend never see a missing employeeId on first click.
  if (typeof window !== 'undefined' && appraisalUser) {
    window.__HRMS_APPRAISAL_USER__ = appraisalUser as Record<string, unknown>;
    window.__HRMS_APPRAISAL_LOGOUT__ = () => {
      logout();
      router.replace('/login');
    };
  }

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace('/login');
    }
  }, [isReady, router, user]);

  if (!isReady || !user || !appraisalUser) {
    return (
      <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return <AppraisalApp user={appraisalUser} />;
}
