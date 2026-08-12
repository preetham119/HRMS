'use client';

import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeModeProvider } from './contexts/ThemeContext';
import { AppraisalErrorBoundary } from './AppraisalErrorBoundary';
import AppRoutes from './routes/AppRoutes';

const ROLE_HOME = {
  employee: '/employee/dashboard',
  manager: '/manager/dashboard',
  hr: '/hr/dashboard',
  leadership: '/leadership/dashboard',
  admin: '/admin/dashboard',
};

export default function AppraisalApp({ user }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
            staleTime: 0,
          },
        },
      }),
  );

  // MemoryRouter avoids Next.js / hash routing clashes that can leave Self Appraisal blank.
  const initialEntry = useMemo(
    () => ROLE_HOME[user?.role] || '/employee/dashboard',
    [user?.role],
  );

  return (
    <AppraisalErrorBoundary>
      <div className="appraisal-embedded">
        <QueryClientProvider client={queryClient}>
          <ThemeModeProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
              <AuthProvider user={user}>
                <AppRoutes />
                <ToastContainer position="top-right" autoClose={3500} newestOnTop theme="colored" />
              </AuthProvider>
            </MemoryRouter>
          </ThemeModeProvider>
        </QueryClientProvider>
      </div>
    </AppraisalErrorBoundary>
  );
}
