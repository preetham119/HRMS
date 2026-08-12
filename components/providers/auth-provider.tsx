'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { normalizeAppRole, type AppRole } from '@/lib/auth';

export interface UserProfile {
  id: string;
  email: string;
  role: AppRole;
  employeeId: string;
  name?: string;
  department?: string;
  profilePicture?: string | null;
  companyId?: string;
  companyName?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void | Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMembershipUser(): Promise<UserProfile | null> {
  const response = await fetch('/api/me', { credentials: 'include' });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to load membership');
  }
  const data = await response.json();
  return {
    id: data.id,
    email: data.email,
    role: normalizeAppRole(data.role),
    employeeId: data.employeeId,
    name: data.name,
    companyId: data.companyId,
    companyName: data.companyName,
    department: undefined,
    profilePicture: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setUser(null);
      setToken(null);
      return;
    }

    setToken(session.access_token);
    const membershipUser = await fetchMembershipUser();
    setUser(membershipUser);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        setUser(null);
        setToken(null);
      } finally {
        if (mounted) setIsReady(true);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Auth state refresh failed:', error);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser, supabase]);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid credentials');
      }

      const membershipUser = await fetchMembershipUser();
      if (!membershipUser) {
        await supabase.auth.signOut();
        throw new Error('No company access. Ask your admin for a join link, or enroll your company.');
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setToken(session?.access_token ?? null);
      setUser(membershipUser);
    },
    [supabase],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isReady,
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, token, isReady, login, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
