import { useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, Typography, Stack, TextField, Button,
  FormControlLabel, Checkbox, Alert, Box, Chip, LinearProgress, Divider, Avatar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { appraisalApi } from '../../services';
import { PageHeader, StatusChip, LoadingSkeleton, ConfirmDialog, PageTransition } from '../../components/common';
import {
  StarRating, RatingSummaryBar, StarScore, PerformanceBadge,
} from '../../components/common/StarRating';
import { averageRating, formatDate } from '../../utils/helpers';

const isSeniorRole = (designation = '') =>
  /senior|lead|manager|principal|head|director/i.test(designation);

function scoreFor(ratings, type, referenceId) {
  const match = (ratings || []).find(
    (r) => r.rating_type === type && String(r.reference_id) === String(referenceId),
  );
  return match ? Number(match.score) : 0;
}

function DetailBlock({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {children || '—'}
      </Typography>
    </Box>
  );
}

export default function ReviewAppraisal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    comments: '',
    recommend_promotion: false,
    recommend_increment: false,
    recommend_training: '',
    development_plan: '',
  });
  const [compRatings, setCompRatings] = useState({});
  const [compComments, setCompComments] = useState({});
  const [goalRatings, setGoalRatings] = useState({});
  const [confirm, setConfirm] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['appraisal', id],
    queryFn: () => appraisalApi.get(id).then((r) => r.data.data),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!data) return;
    const mr = data.managerReview;
    if (mr) {
      setForm({
        comments: mr.comments || '',
        recommend_promotion: !!mr.recommend_promotion,
        recommend_increment: !!mr.recommend_increment,
        recommend_training: mr.recommend_training || '',
        development_plan: mr.development_plan || '',
      });
    }
    const cr = {};
    const cc = {};
    const gr = {};
    (data.ratings || []).filter((r) => r.rated_by === 'manager').forEach((r) => {
      const key = String(r.reference_id);
      if (r.rating_type === 'competency') {
        cr[key] = Number(r.score);
        if (r.comments) cc[key] = r.comments;
      }
      if (r.rating_type === 'goal') gr[key] = Number(r.score);
    });
    setCompRatings(cr);
    setCompComments(cc);
    setGoalRatings(gr);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload) => appraisalApi.saveManagerReview(id, payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ['appraisal', id] });
      qc.invalidateQueries({ queryKey: ['pending-reviews'] });
      qc.invalidateQueries({ queryKey: ['manager-dashboard'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['completed-reviews'] });
      setConfirm(false);
      if (res.data.message?.includes('submitted')) navigate('/manager/completed-reviews');
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Failed'),
  });

  const competencies = useMemo(() => {
    if (!data) return [];
    const senior = isSeniorRole(data.appraisal?.designation);
    return (data.competencies || []).filter((c) => !c.is_leadership_only || senior);
  }, [data]);

  const employeeRatings = useMemo(
    () => (data?.ratings || []).filter((r) => r.rated_by === 'employee'),
    [data],
  );

  const empCompAvg = averageRating(
    competencies.map((c) => scoreFor(employeeRatings, 'competency', c.id)).filter((v) => v > 0),
  );
  const empGoalAvg = averageRating(
    (data?.goals || []).map((g) => scoreFor(employeeRatings, 'goal', g.id)).filter((v) => v > 0),
  );

  const avgCompetency = averageRating(Object.values(compRatings));
  const avgGoal = averageRating(Object.values(goalRatings));
  const overall = useMemo(() => {
    if (avgCompetency && avgGoal) return Math.round((avgGoal * 0.6 + avgCompetency * 0.4) * 10) / 10;
    return avgCompetency || avgGoal || 0;
  }, [avgCompetency, avgGoal]);

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError || !data?.appraisal) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}
      >
        Appraisal not found or failed to load.
      </Alert>
    );
  }

  const locked = data.managerReview?.status === 'submitted' && data.appraisal.status !== 'returned';
  const a = data.appraisal;
  const goals = data.goals || [];

  const buildPayload = (submit) => ({
    ...form,
    submit,
    competency_ratings: Object.entries(compRatings)
      .filter(([, score]) => Number(score) > 0)
      .map(([competency_id, score]) => ({
        competency_id: Number(competency_id),
        score: Number(score),
        comments: compComments[competency_id] || null,
      })),
    goal_ratings: Object.entries(goalRatings)
      .filter(([, score]) => Number(score) > 0)
      .map(([goal_id, score]) => ({
        goal_id: Number(goal_id),
        score: Number(score),
      })),
  });

  const canSubmit = Object.values(compRatings).filter((v) => Number(v) > 0).length >= 3;

  return (
    <PageTransition>
      <PageHeader
        title={`Review — ${a.employee_name}`}
        subtitle={`${a.cycle_name || 'Current cycle'} · ${a.designation || ''} · ${a.department_name || a.department || ''}`}
        breadcrumbs={[
          { label: 'Manager', to: '/manager/dashboard' },
          { label: 'Pending Reviews', to: '/manager/pending-reviews' },
          { label: 'Review' },
        ]}
        action={<StatusChip status={a.status} />}
      />

      {locked && <Alert severity="info" sx={{ mb: 2 }}>This review has been submitted and cannot be modified.</Alert>}
      {!locked && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Review the employee&apos;s full self-assessment below, then enter your ratings and submit to Admin.
        </Alert>
      )}
      {mutation.isPending && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* ── Section 1: Employee submitted details ── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={2.5}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700 }}>
              {(a.employee_name || '?')[0]}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={800}>{a.employee_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {a.employee_code} · {a.designation} · {a.department_name || a.department}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submitted {a.submitted_at || a.submittedAt ? formatDate(a.submitted_at || a.submittedAt) : '—'}
                {a.cycle_name ? ` · ${a.cycle_name}` : ''}
              </Typography>
            </Box>
            <Box textAlign={{ sm: 'right' }}>
              <Typography variant="caption" color="text.secondary" display="block">Employee self rating</Typography>
              <StarScore value={a.self_rating ?? a.selfRating} showBadge />
            </Box>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Typography variant="subtitle1" fontWeight={800} mb={1.5}>
            Employee Self-Assessment Details
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 2.5,
              mb: 2.5,
            }}
          >
            <DetailBlock label="Achievements">{a.achievements}</DetailBlock>
            <DetailBlock label="Challenges">{a.challenges}</DetailBlock>
            <DetailBlock label="Self Feedback">{a.self_feedback || a.selfFeedback}</DetailBlock>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
            <Chip label={`Self overall: ${Number(a.self_rating ?? a.selfRating) || '—'}★`} color="primary" variant="outlined" />
            <Chip label={`Self competency avg: ${empCompAvg || '—'}★`} variant="outlined" />
            <Chip label={`Self goal avg: ${empGoalAvg || '—'}★`} variant="outlined" />
            <Chip label={`${goals.length} goals`} variant="outlined" />
            <Chip label={`${competencies.length} competencies`} variant="outlined" />
          </Stack>
        </CardContent>
      </Card>

      {/* ── Section 2: Goals — employee score vs manager rating ── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} mb={0.5}>Goals — Employee score vs Your rating</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Review each goal the employee rated, then provide your manager rating.
          </Typography>
          {!goals.length && (
            <Alert severity="warning">No goals found for this employee in the open cycle.</Alert>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {goals.map((g) => {
              const empScore = scoreFor(employeeRatings, 'goal', g.id);
              return (
                <Card key={g.id} variant="outlined">
                  <CardContent>
                    <Typography fontWeight={700}>{g.goal_name || g.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      {g.description || g.kpi || '—'} · Progress {g.progress || 0}% · Weight {g.weightage || 0}%
                    </Typography>
                    <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap" useFlexGap>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Employee rated</Typography>
                        <StarScore value={empScore} showBadge />
                      </Box>
                      <Box flex={1} minWidth={180}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Your rating</Typography>
                        <StarRating
                          value={goalRatings[String(g.id)] || 0}
                          onChange={(v) => setGoalRatings({ ...goalRatings, [String(g.id)]: v })}
                          readOnly={locked}
                          precision={0.5}
                          showLabel={false}
                          size="medium"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* ── Section 3: Competencies — side by side ── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} mb={0.5}>Competencies — Employee score vs Your rating</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Employee self-scores are shown for reference. Enter your manager ratings (at least 3 required to submit).
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {competencies.map((c) => {
              const empScore = scoreFor(employeeRatings, 'competency', c.id);
              const key = String(c.id);
              return (
                <Card key={c.id} variant="outlined" sx={{ borderColor: empScore ? 'divider' : 'divider' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} mb={1}>
                      <Box>
                        <Typography fontWeight={700}>{c.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.description}</Typography>
                      </Box>
                      {!!c.is_leadership_only && <Chip size="small" label="Leadership" color="secondary" />}
                    </Stack>
                    <Box
                      sx={{
                        mb: 1.5,
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Employee self-score
                      </Typography>
                      <StarScore value={empScore} showBadge />
                    </Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Your manager rating
                    </Typography>
                    <StarRating
                      value={compRatings[key] || 0}
                      onChange={(v) => setCompRatings({ ...compRatings, [key]: v })}
                      readOnly={locked}
                      precision={0.5}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      sx={{ mt: 1.25 }}
                      label="Comments (optional)"
                      placeholder="Add feedback for this competency…"
                      value={compComments[key] || ''}
                      onChange={(e) => setCompComments({ ...compComments, [key]: e.target.value })}
                      disabled={locked}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Box mb={2.5}>
        <RatingSummaryBar
          average={overall || data.managerReview?.overall_rating}
          count={Object.values(compRatings).filter((v) => Number(v) > 0).length}
          total={competencies.length}
        />
      </Box>

      {/* ── Section 4: Manager recommendations ── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} mb={2}>Your Recommendations & Feedback</Typography>
          <Stack spacing={2.5}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">Your competency avg</Typography>
                <StarScore value={avgCompetency || data.managerReview?.competency_score} showBadge />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Your goal score</Typography>
                <StarScore value={avgGoal || data.managerReview?.goal_score} showBadge />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Overall (60% goals + 40% competency)</Typography>
                <PerformanceBadge value={overall || data.managerReview?.overall_rating} />
              </Box>
            </Box>

            <TextField
              label="Manager Comments"
              multiline
              rows={3}
              fullWidth
              disabled={locked}
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Summarize performance against the employee’s self-assessment…"
            />
            <TextField
              label="Development Plan"
              multiline
              rows={2}
              fullWidth
              disabled={locked}
              value={form.development_plan}
              onChange={(e) => setForm({ ...form, development_plan: e.target.value })}
            />
            <TextField
              label="Recommend Training"
              fullWidth
              disabled={locked}
              value={form.recommend_training}
              onChange={(e) => setForm({ ...form, recommend_training: e.target.value })}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControlLabel
                control={(
                  <Checkbox
                    disabled={locked}
                    checked={form.recommend_promotion}
                    onChange={(e) => setForm({ ...form, recommend_promotion: e.target.checked })}
                  />
                )}
                label="Recommend Promotion"
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    disabled={locked}
                    checked={form.recommend_increment}
                    onChange={(e) => setForm({ ...form, recommend_increment: e.target.checked })}
                  />
                )}
                label="Recommend Increment"
              />
            </Stack>

            {!locked && (
              <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                {!canSubmit && (
                  <Typography variant="caption" color="warning.main" sx={{ mr: 'auto' }}>
                    Rate at least 3 competencies before submitting.
                  </Typography>
                )}
                <Button variant="outlined" onClick={() => mutation.mutate(buildPayload(false))} disabled={mutation.isPending}>
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setConfirm(true)}
                  disabled={mutation.isPending || !canSubmit}
                >
                  Submit to Admin
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm}
        title="Submit Review to Admin?"
        message="Once submitted, you cannot modify this review. The appraisal will move to Admin review."
        confirmText="Submit"
        onCancel={() => setConfirm(false)}
        onConfirm={() => mutation.mutate(buildPayload(true))}
        loading={mutation.isPending}
      />
    </PageTransition>
  );
}
