import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Grid,
  Avatar,
  Button,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const ROLE_THEMES = {
  employee: {
    main: '#1565C0',
    soft: 'rgba(21, 101, 192, 0.12)',
    softBorder: 'rgba(21, 101, 192, 0.28)',
    bar: 'linear-gradient(90deg, #1565C0 0%, #42A5F5 100%)',
    Icon: PersonOutlineIcon,
  },
  manager: {
    main: '#7B1FA2',
    soft: 'rgba(123, 31, 162, 0.12)',
    softBorder: 'rgba(123, 31, 162, 0.28)',
    bar: 'linear-gradient(90deg, #7B1FA2 0%, #AB47BC 100%)',
    Icon: AssignmentOutlinedIcon,
  },
  hr: {
    main: '#2E7D32',
    soft: 'rgba(46, 125, 50, 0.12)',
    softBorder: 'rgba(46, 125, 50, 0.28)',
    bar: 'linear-gradient(90deg, #2E7D32 0%, #66BB6A 100%)',
    Icon: BarChartOutlinedIcon,
  },
  leadership: {
    main: '#00695C',
    soft: 'rgba(0, 105, 92, 0.12)',
    softBorder: 'rgba(0, 105, 92, 0.28)',
    bar: 'linear-gradient(90deg, #00695C 0%, #26A69A 100%)',
    Icon: BarChartOutlinedIcon,
  },
  admin: {
    main: '#1565C0',
    soft: 'rgba(21, 101, 192, 0.12)',
    softBorder: 'rgba(21, 101, 192, 0.28)',
    bar: 'linear-gradient(90deg, #1565C0 0%, #42A5F5 100%)',
    Icon: BarChartOutlinedIcon,
  },
};

function StepCircle({ step, accent, isLast }) {
  const done = step.status === 'completed';
  const active = step.status === 'active';

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
        {!isLast && (
          <Box
            sx={{
              position: 'absolute',
              top: 18,
              left: '50%',
              width: '100%',
              height: 3,
              bgcolor: done ? accent : 'divider',
              zIndex: 0,
              transition: 'background-color 0.35s ease',
            }}
          />
        )}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              color: done || active ? '#fff' : 'text.disabled',
              bgcolor: done || active ? accent : 'background.paper',
              border: '2px solid',
              borderColor: done || active ? accent : 'divider',
              boxShadow: active ? `0 0 0 4px ${accent}22` : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {done ? <CheckIcon sx={{ fontSize: 20 }} /> : step.number}
          </Box>
        </motion.div>
        <Typography
          variant="caption"
          fontWeight={active || done ? 700 : 500}
          textAlign="center"
          sx={{
            mt: 1,
            px: 0.5,
            color: active || done ? 'text.primary' : 'text.secondary',
            lineHeight: 1.25,
            maxWidth: 96,
          }}
        >
          {step.label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function WorkflowProgressBar({
  progress,
  role = 'employee',
  title = 'Your Progress',
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const qc = useQueryClient();
  const palette = ROLE_THEMES[role] || ROLE_THEMES.employee;
  const ActionIcon = palette.Icon;

  const wp = progress || {
    percent: 0,
    steps: [],
    nextAction: 'No action available.',
  };
  const percent = Math.min(100, Math.max(0, Number(wp.percent) || 0));
  const steps = wp.steps || [];

  const openAction = async () => {
    if (!wp.actionLink) return;
    // Drop stale "no cycle" cache so Self Appraisal always loads fresh after HR opens a cycle.
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['my-appraisal'] }),
      qc.invalidateQueries({ queryKey: ['employee-dashboard'] }),
      qc.invalidateQueries({ queryKey: ['notifications'] }),
    ]);
    navigate(wp.actionLink);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight={700} mb={2.5}>
                {title}
              </Typography>

              <Stack
                direction="row"
                alignItems="flex-start"
                sx={{
                  mb: 3,
                  overflowX: isMobile ? 'auto' : 'visible',
                  pb: isMobile ? 1 : 0,
                }}
              >
                {steps.map((step, i) => (
                  <StepCircle
                    key={step.id || i}
                    step={step}
                    accent={palette.main}
                    isLast={i === steps.length - 1}
                  />
                ))}
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Overall completion
                </Typography>
                <motion.div
                  key={percent}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: palette.main }}>
                    {percent}% Completed
                  </Typography>
                </motion.div>
              </Stack>

              <Box
                sx={{
                  position: 'relative',
                  height: 14,
                  borderRadius: 999,
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  mb: 1.75,
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%' }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      height: '100%',
                      borderRadius: 999,
                      bgcolor: 'transparent',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        background: palette.bar,
                      },
                    }}
                  />
                </motion.div>
              </Box>

              <Stack direction="row" spacing={0.75} alignItems="center">
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">
                  Progress updates automatically as you complete each step.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderColor: palette.softBorder,
              background:
                theme.palette.mode === 'light'
                  ? `linear-gradient(160deg, ${palette.soft} 0%, ${theme.palette.background.paper} 55%)`
                  : theme.palette.background.paper,
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, sm: 2.5 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="overline"
                fontWeight={700}
                sx={{ color: palette.main, letterSpacing: 0.8 }}
              >
                Next Action
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="flex-start" mt={1.25}>
                <Avatar
                  sx={{
                    bgcolor: palette.soft,
                    color: palette.main,
                    width: 48,
                    height: 48,
                    border: `1px solid ${palette.softBorder}`,
                  }}
                >
                  <ActionIcon />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.45 }}>
                    {wp.nextAction || 'No action available.'}
                  </Typography>
                  {wp.currentStepLabel && percent < 100 && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
                      Current step: {wp.currentStepLabel}
                    </Typography>
                  )}
                </Box>
              </Stack>

              {wp.actionLink && wp.actionLabel && (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  onClick={openAction}
                  sx={{
                    mt: 2.25,
                    bgcolor: palette.main,
                    '&:hover': { bgcolor: palette.main, filter: 'brightness(0.92)' },
                  }}
                >
                  {wp.actionLabel}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
}
