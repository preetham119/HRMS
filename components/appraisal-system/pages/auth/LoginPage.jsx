import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Stack, Alert,
  InputAdornment, IconButton, CircularProgress, Chip,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth, DASHBOARD_PATHS } from '../../contexts/AuthContext';
import LoginProgressOverlay from '../../components/common/LoginProgressOverlay';
import { runLoginProgress } from '../../utils/helpers';
import api from '../../services/api';
import { dashboardApi } from '../../services';

const DEMO_ACCOUNTS = [
  { role: 'HR', email: 'hr@company.com' },
  { role: 'Manager', email: 'manager.eng@company.com' },
  { role: 'Employee', email: 'john.doe@company.com' },
  { role: 'Leadership', email: 'leadership@company.com' },
  { role: 'Admin', email: 'admin@company.com' },
];

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingRole, setPendingRole] = useState('');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { email: '', password: 'Password@123' },
  });

  if (isAuthenticated && user && !bootstrapping) {
    return <Navigate to={DASHBOARD_PATHS[user.role]} replace />;
  }

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    let loggedIn = null;
    try {
      loggedIn = await login(data.email, data.password, { skipNavigate: true });
      setPendingRole(loggedIn.role);
      setBootstrapping(true);
      setProgress(0);

      try {
        await runLoginProgress(setProgress, [
          async () => { await api.get('/auth/me'); },
          async () => {
            if (loggedIn.role === 'employee') await dashboardApi.employee();
            else if (loggedIn.role === 'manager') await dashboardApi.manager();
            else if (loggedIn.role === 'leadership') await dashboardApi.leadership();
            else if (loggedIn.role === 'admin') await dashboardApi.admin();
            else await dashboardApi.hr();
          },
          async () => { await api.get('/notifications', { params: { limit: 5 } }); },
          async () => { await new Promise((r) => setTimeout(r, 200)); },
        ]);
      } catch {
        // Auth already succeeded — continue to dashboard even if prefetch fails
        setProgress(100);
      }

      toast.success(`Welcome back, ${loggedIn.firstName}!`);
      navigate(DASHBOARD_PATHS[loggedIn.role] || '/login', { replace: true });
    } catch (err) {
      setBootstrapping(false);
      setProgress(0);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0A1929',
        backgroundImage: 'url(/images/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(10,25,41,0.82) 0%, rgba(13,71,161,0.72) 45%, rgba(2,119,189,0.65) 100%)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 20% 20%, rgba(66,165,245,0.18) 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(2,119,189,0.2) 0%, transparent 40%)',
          zIndex: 0,
          pointerEvents: 'none',
        },
      }}
    >
      <LoginProgressOverlay open={bootstrapping} progress={progress} role={pendingRole} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}
      >
        <Card
          sx={{
            width: '100%',
            bgcolor: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack alignItems="center" spacing={1} mb={3}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <AssessmentIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} textAlign="center">
                Growth & Appraisal
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Sign in to your enterprise performance workspace
              </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email"
                  fullWidth
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                />
                <TextField
                  label="Password"
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register('password', { required: 'Password is required' })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading || bootstrapping}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </Box>

            <Box mt={3}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1} textAlign="center">
                Demo accounts (password: Password@123)
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                {DEMO_ACCOUNTS.map((a) => (
                  <Chip
                    key={a.email}
                    label={a.role}
                    size="small"
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={() => setValue('email', a.email)}
                  />
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
