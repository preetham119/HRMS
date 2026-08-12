import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  'Authenticating securely…',
  'Loading your profile…',
  'Preparing workspace…',
  'Initializing dashboard…',
  'Almost ready…',
];

export default function LoginProgressOverlay({ open, progress = 0, role }) {
  const stepIndex = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 45%, #0277BD 100%)',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 440,
              px: 3,
              textAlign: 'center',
              color: '#fff',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <AssessmentIcon sx={{ fontSize: 40 }} />
              </Box>
            </motion.div>

            <Typography variant="h5" fontWeight={700} mb={0.5}>
              Growth & Appraisal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
              {role ? `Setting up your ${role} workspace` : 'Preparing your session'}
            </Typography>

            <Stack spacing={1.25} sx={{ textAlign: 'left' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  {STEPS[stepIndex]}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {Math.min(100, Math.round(progress))}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, progress)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #90CAF9, #FFFFFF)',
                  },
                }}
              />
            </Stack>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
