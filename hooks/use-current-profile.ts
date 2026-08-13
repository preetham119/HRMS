'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  fetchEmployeeProfile,
  type EmployeeProfile,
} from '@/lib/employee-profile';

export type CurrentEmployeeIdentity = {
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  manager: string;
  status: string;
  profilePicture?: string | null;
  profile: EmployeeProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function firstNameFrom(name: string) {
  return name.trim().split(/\s+/).filter(Boolean)[0] ?? '';
}

function lastNameFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/** Single source of truth for identity shown on Dashboard, Profile, shell, etc. */
export function useCurrentProfile(): CurrentEmployeeIdentity {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchEmployeeProfile();
      setProfile(result);
      updateUser({
        employeeId: result.employeeId,
        name: `${result.firstName} ${result.lastName}`.trim(),
        department: result.department,
        profilePicture: result.profilePicture ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.id]);

  const name =
    (profile ? `${profile.firstName} ${profile.lastName}`.trim() : '') ||
    user?.name?.trim() ||
    '';

  return {
    employeeId: profile?.employeeId || user?.employeeId || '',
    name,
    firstName: profile?.firstName || firstNameFrom(name) || firstNameFrom(user?.name ?? ''),
    lastName: profile?.lastName || lastNameFrom(name) || lastNameFrom(user?.name ?? ''),
    email: profile?.officialEmail || user?.email || '',
    department: profile?.department || user?.department || '',
    designation: profile?.designation || '',
    location: profile?.location || '',
    manager: profile?.manager || '',
    status: profile?.status || 'Active',
    profilePicture: profile?.profilePicture ?? user?.profilePicture ?? null,
    profile,
    isLoading,
    error,
    refresh,
  };
}
