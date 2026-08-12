import { Component, useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, Typography, Stack, TextField, Button, Box,
  Alert, CircularProgress, Chip, LinearProgress, Paper,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appraisalApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader, StatusChip, LoadingSkeleton, ConfirmDialog } from '../../components/common';
import {
  StarRating, CompetencyRatingCard, RatingSummaryBar, StarScore,
} from '../../components/common/StarRating';
import { averageRating } from '../../utils/helpers';

class SelfAppraisalBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Box p={3}>
          <Alert
            severity="error"
            action={(
              <Button color="inherit" size="small" onClick={() => window.location.assign('/performance')}>
                Reload
              </Button>
            )}
          >
            Self Appraisal failed to render: {this.state.error?.message || 'Unknown error'}
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

function SelfAppraisalForm() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    achievements: '',
    challenges: '',
    self_feedback: '',
    self_rating: 3,
  });
  const [compRatings, setCompRatings] = useState({});
  const [goalRatings, setGoalRatings] = useState({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['my-appraisal', user?.employeeId || user?.email || 'anon'],
    queryFn: async () => {
      const res = await appraisalApi.my();
      return res?.data?.data ?? null;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const { data: comps } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => {
      const res = await appraisalApi.competencies();
      return res?.data?.data ?? [];
    },
  });

  useEffect(() => {
    if (!data?.appraisal) return;
    const a = data.appraisal;
    setForm({
      achievements: a.achievements || '',
      challenges: a.challenges || '',
      self_feedback: a.self_feedback || a.selfFeedback || '',
      self_rating: Number(a.self_rating ?? a.selfRating) || 3,
    });
    const cr = {};
    const gr = {};
    (data.ratings || []).filter((r) => r.rated_by === 'employee').forEach((r) => {
      if (r.rating_type === 'competency') cr[String(r.reference_id)] = Number(r.score);
      if (r.rating_type === 'goal') gr[String(r.reference_id)] = Number(r.score);
    });
    setCompRatings(cr);
    setGoalRatings(gr);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => appraisalApi.saveMy(payload),
    onSuccess: async (res, variables) => {
      toast.success(res.data.message);
      setConfirmSubmit(false);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['my-appraisal'] }),
        qc.invalidateQueries({ queryKey: ['employee-dashboard'] }),
        qc.invalidateQueries({ queryKey: ['notifications'] }),
      ]);
      if (variables?.submit) navigate('/employee/dashboard');
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Save failed'),
  });

  const visibleComps = useMemo(
    () => (comps || []).filter((c) => !c.is_leadership_only && !c.isLeadershipOnly),
    [comps],
  );

  const ratedCount = Object.values(compRatings).filter((v) => Number(v) > 0).length;
  const avgCompetency = averageRating(Object.values(compRatings));
  const avgGoal = averageRating(Object.values(goalRatings));
  const overall = averageRating([form.self_rating, avgCompetency, avgGoal].filter((v) => v > 0));

  const canSubmit = Boolean(
    form.achievements?.trim()
    && form.self_rating > 0
    && ratedCount >= Math.min(3, visibleComps.length || 3),
  );

  const buildPayload = (submit) => ({
    ...form,
    submit,
    competency_ratings: Object.entries(compRatings)
      .filter(([, score]) => Number(score) > 0)
      .map(([competency_id, score]) => ({
        competency_id: Number(competency_id),
        score: Number(score),
      })),
    goal_ratings: Object.entries(goalRatings)
      .filter(([, score]) => Number(score) > 0)
      .map(([goal_id, score]) => ({
        goal_id: Number(goal_id),
        score: Number(score),
      })),
  });

  const handleSubmitClick = () => {
    if (!form.achievements?.trim()) {
      toast.error('Please add your achievements before submitting.');
      return;
    }
    if (!form.self_rating) {
      toast.error('Please select your overall self rating.');
      return;
    }
    if (ratedCount < Math.min(3, visibleComps.length || 3)) {
      toast.error('Please rate at least 3 competencies before submitting.');
      return;
    }
    setConfirmSubmit(true);
  };

  if (isLoading && !data) return <LoadingSkeleton rows={8} />;

  if (isError) {
    return (
      <Box>
        <PageHeader title="Self Appraisal" breadcrumbs={[{ label: 'Employee', to: '/employee/dashboard' }, { label: 'Self Appraisal' }]} />
        <Alert
          severity="error"
          action={(
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => refetch()}>
              Retry
            </Button>
          )}
        >
          {error?.response?.data?.message || error?.message || 'Failed to load self appraisal.'}
        </Alert>
      </Box>
    );
  }

  if (!data?.cycle) {
    return (
      <Box>
        <PageHeader title="Self Appraisal" breadcrumbs={[{ label: 'Employee', to: '/employee/dashboard' }, { label: 'Self Appraisal' }]} />
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={(
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={isFetching}>
              Refresh
            </Button>
          )}
        >
          No open appraisal cycle yet. Ask HR to use <strong>Create &amp; Open Cycle</strong>, then click Refresh.
        </Alert>
        <Card variant="outlined">
          <CardContent>
            <Typography fontWeight={700} gutterBottom>Waiting for HR to open a cycle</Typography>
            <Typography variant="body2" color="text.secondary">
              Once HR opens the cycle you will be able to fill achievements, rate competencies, and submit your self-assessment here.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const status = data.appraisal?.status || 'draft';
  const locked = Boolean(data.appraisal) && !['draft', 'returned'].includes(status);
  const editable = !locked;
  const cycleName = data.cycle.name || data.cycle.cycle_name || 'Current cycle';

  return (
    <Box sx={{ pb: editable ? 10 : 2 }}>
      <PageHeader
        title="Self Appraisal"
        subtitle={cycleName}
        breadcrumbs={[{ label: 'Employee', to: '/employee/dashboard' }, { label: 'Self Appraisal' }]}
        action={<StatusChip status={status} />}
      />

      <Alert severity={editable ? 'info' : 'success'} sx={{ mb: 2 }}>
        {editable
          ? 'Fill achievements, rate yourself, rate at least 3 competencies, then Submit.'
          : 'This appraisal is submitted and locked while it moves through Manager → Admin → CEO.'}
      </Alert>

      {saveMutation.isPending && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Box mb={2.5}>
        <RatingSummaryBar average={overall} count={ratedCount} total={visibleComps.length} />
      </Box>

      <Stack spacing={2.5}>
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <TextField
                label="Achievements *"
                multiline
                rows={3}
                fullWidth
                disabled={!editable}
                value={form.achievements}
                onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                placeholder="Key achievements this cycle…"
              />
              <TextField
                label="Challenges"
                multiline
                rows={2}
                fullWidth
                disabled={!editable}
                value={form.challenges}
                onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                placeholder="Main challenges faced…"
              />
              <TextField
                label="Self Feedback"
                multiline
                rows={2}
                fullWidth
                disabled={!editable}
                value={form.self_feedback}
                onChange={(e) => setForm({ ...form, self_feedback: e.target.value })}
                placeholder="Brief self-reflection…"
              />
              <StarRating
                label="Overall Self Rating *"
                value={form.self_rating}
                onChange={(v) => setForm({ ...form, self_rating: v })}
                readOnly={!editable}
                precision={0.5}
              />
            </Stack>
          </CardContent>
        </Card>

        <Box>
          <Typography variant="h6" fontWeight={700} mb={0.5}>Competency Self-Assessment</Typography>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Rate each area with stars (1–5). At least 3 ratings required to submit.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {visibleComps.map((c) => (
              <CompetencyRatingCard
                key={c.id}
                name={c.name}
                description={c.description}
                value={compRatings[String(c.id)] || 0}
                onChange={(v) => setCompRatings({ ...compRatings, [String(c.id)]: v })}
                readOnly={!editable}
              />
            ))}
          </Box>
          {!visibleComps.length && (
            <Alert severity="warning" sx={{ mt: 1 }}>Competencies are still loading…</Alert>
          )}
        </Box>

        {(data.goals || []).length > 0 && (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={1.5}>Goal Ratings</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              {(data.goals || []).map((g) => (
                <Card key={g.id} variant="outlined">
                  <CardContent>
                    <Typography fontWeight={700}>{g.goal_name || g.name}</Typography>
                    <Chip size="small" label={`${g.progress || 0}% complete`} sx={{ my: 1 }} color="primary" variant="outlined" />
                    <StarRating
                      value={goalRatings[String(g.id)] || 0}
                      onChange={(v) => setGoalRatings({ ...goalRatings, [String(g.id)]: v })}
                      readOnly={!editable}
                      precision={0.5}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>Live Scores</Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Self Rating</Typography>
                <StarScore value={form.self_rating} showBadge />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Competency Average</Typography>
                <StarScore value={avgCompetency} showBadge />
              </Box>
              <Typography fontWeight={700}>{ratedCount}/{visibleComps.length} competencies rated</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {editable && (
        <Paper
          elevation={6}
          sx={{
            position: 'sticky',
            bottom: 0,
            mt: 3,
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 5,
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
            <Button
              startIcon={saveMutation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
              variant="outlined"
              onClick={() => saveMutation.mutate(buildPayload(false))}
              disabled={saveMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              startIcon={<SendIcon />}
              variant="contained"
              onClick={handleSubmitClick}
              disabled={saveMutation.isPending || !canSubmit}
            >
              Submit Appraisal
            </Button>
          </Stack>
        </Paper>
      )}

      <ConfirmDialog
        open={confirmSubmit}
        title="Submit Self Appraisal?"
        message="Once submitted, you will not be able to edit this appraisal. Continue?"
        confirmText="Submit"
        onCancel={() => setConfirmSubmit(false)}
        onConfirm={() => saveMutation.mutate(buildPayload(true))}
        loading={saveMutation.isPending}
      />
    </Box>
  );
}

export default function SelfAppraisal() {
  return (
    <SelfAppraisalBoundary>
      <SelfAppraisalForm />
    </SelfAppraisalBoundary>
  );
}
