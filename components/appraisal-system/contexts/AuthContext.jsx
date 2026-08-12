import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const DASHBOARD_PATHS = {
  employee: '/employee/dashboard',
  manager: '/manager/dashboard',
  hr: '/hr/dashboard',
  leadership: '/leadership/dashboard',
  admin: '/admin/dashboard',
};

function readBridgedUser(initialUser) {
  if (initialUser) return initialUser;
  if (typeof window !== 'undefined') return window.__HRMS_APPRAISAL_USER__ || null;
  return null;
}

export function AuthProvider({ children, user: initialUser }) {
  const [user, setUser] = useState(() => readBridgedUser(initialUser));
  const [loading, setLoading] = useState(() => !readBridgedUser(initialUser));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    window.__HRMS_APPRAISAL_LOGOUT__?.();
    setUser(null);
    window.location.assign('/login');
  }, []);

  useEffect(() => {
    const bridged = readBridgedUser(initialUser);
    setUser(bridged);
    setLoading(false);
    if (bridged && typeof window !== 'undefined') {
      window.__HRMS_APPRAISAL_USER__ = bridged;
    }
  }, [initialUser]);

  // Keep bridge in sync for localBackend actor() on every user change.
  if (typeof window !== 'undefined' && user) {
    window.__HRMS_APPRAISAL_USER__ = user;
  }

  const login = async () => {
    const bridgedUser = readBridgedUser(initialUser);
    if (!bridgedUser) throw new Error('Please sign in to HRMS first.');
    setUser(bridgedUser);
    navigate(DASHBOARD_PATHS[bridgedUser.role] || '/employee/dashboard');
    return bridgedUser;
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      window.__HRMS_APPRAISAL_USER__ = next;
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { DASHBOARD_PATHS };
