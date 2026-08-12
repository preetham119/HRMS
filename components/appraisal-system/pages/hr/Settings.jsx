import { useState } from 'react';
import {
  Card, CardContent, Typography, Stack, Switch, FormControlLabel, Divider, Box, Chip, Rating, Button, Alert,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useThemeMode } from '../../contexts/ThemeContext';
import { PageHeader, PageTransition, ConfirmDialog } from '../../components/common';
import { appraisalApi } from '../../services';
import { RATING_SCALE, ratingLabel } from '../../utils/helpers';

export default function Settings() {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';
  const qc = useQueryClient();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await appraisalApi.resetDemo();
      await qc.invalidateQueries();
      toast.success('Demo reset — Self Appraisal and all role queues are blank again.');
      setConfirmReset(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reset demo');
    } finally {
      setResetting(false);
    }
  };

  return (
    <PageTransition>
      <PageHeader
        title="Settings"
        subtitle="System preferences and reference information"
        breadcrumbs={[{ label: 'HR', to: '/hr/dashboard' }, { label: 'Settings' }]}
      />
      <Stack spacing={2.5} maxWidth={720}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>Demo Reset</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Clears Self Appraisal drafts/submissions, notifications, and Manager / Admin / CEO review queues
              so you can walk the full flow from the start.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              After reset: HR opens the cycle → Employee is notified → Manager → Admin → CEO. Track status in HR Reports.
            </Alert>
            <Button
              variant="contained"
              color="warning"
              startIcon={<RestartAltIcon />}
              onClick={() => setConfirmReset(true)}
              disabled={resetting}
            >
              Reset Appraisal Demo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>Appearance</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Switch between light and dark theme for the Performance module. Organization-wide branding and defaults
              are managed in HRMS Settings → Branding & Theme / System Preferences.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isDark}
                  onChange={toggleMode}
                  inputProps={{ 'aria-label': 'Toggle dark mode' }}
                />
              }
              label={isDark ? 'Dark mode' : 'Light mode'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>Star Rating Scale</Typography>
            <Stack spacing={1.5}>
              {RATING_SCALE.map((r) => (
                <Stack key={r.value} direction="row" spacing={2} alignItems="center">
                  <Rating value={r.value} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#F9A825' } }} />
                  <Chip label={r.value} color="primary" size="small" />
                  <Typography>{r.label}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" mb={1}>
              Performance bands: 4.5–5.0 Outstanding · 3.5–4.49 Exceeds · 2.5–3.49 Meets · 1.5–2.49 Needs Improvement · below 1.5 Unsatisfactory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Rating = (Goal Score × 60%) + (Competency Score × 40%). Half-star precision is supported.
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Example: {ratingLabel(4.3)} for 4.3/5
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>Appraisal Workflow</Typography>
            <Box component="ol" sx={{ pl: 2, m: 0, '& li': { mb: 0.75 } }}>
              <li>HR creates and opens an Appraisal Cycle</li>
              <li>Employees complete and submit Self-Appraisal with star ratings</li>
              <li>Managers rate competencies with stars and submit to Admin</li>
              <li>Admin reviews and sends to Leadership</li>
              <li>Leadership finalizes; employees view feedback</li>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <ConfirmDialog
        open={confirmReset}
        title="Reset appraisal demo?"
        message="This clears Self Appraisal and all Manager / Admin / Leadership reviews so the linked-role workflow can be demoed from the start."
        confirmText="Reset Demo"
        color="warning"
        loading={resetting}
        onConfirm={handleResetDemo}
        onCancel={() => setConfirmReset(false)}
      />
    </PageTransition>
  );
}
