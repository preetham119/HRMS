import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth, DASHBOARD_PATHS } from '../contexts/AuthContext';

function roleHome(role) {
  return DASHBOARD_PATHS[role] || '/employee/dashboard';
}

export function ProtectedRoute({ roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') window.location.assign('/login');
    return null;
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />;
  return <Outlet />;
}
