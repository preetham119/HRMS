import { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Grid, Stack, Typography, Tabs, Tab, TextField, MenuItem,
  Button, Checkbox, FormControlLabel, Chip, Divider, Alert, CircularProgress, LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { appraisalApi } from '../../services';
import {
  PageHeader, LoadingSkeleton, PageTransition, StatusChip, ConfirmDialog, DashboardProfileBanner,
} from '../../components/common';
import { StarScore } from '../../components/common/StarRating';

function RatingComparisonChart({ chartData, summaryData }) {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>Employee vs Manager Competency Ratings</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Side-by-side bar graph of self evaluation and manager review scores
            </Typography>
            {chartData?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Employee" fill="#42A5F5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Manager" fill="#43A047" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info">No competency ratings available yet for comparison.</Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>Overall Rating Comparison</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Aggregate employee self rating vs manager overall rating
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summaryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#43A047" radius={[0, 6, 6, 0]} name="Rating" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box mt={2}>{children}</Box>;
}

const emptyForm = {
  comments: '',
  development_plan: '',
  strengths: '',
  improvements: '',
  recommend_promotion: false,
  promotion_type: '',
  recommend_increment: false,
  salary_revision: '',
  role_change: 'No Change',
  recommended_training: '',
  high_potential: false,
  final_rating: '',
};

export default function AdminReviewAppraisal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-review', id],
    queryFn: () => appraisalApi.adminReview(id).then((r) => r.data.data),
  });

  useEffect(() => {
    if (!data?.adminReview) return;
    const ar = data.adminReview;
    setForm({
      comments: ar.comments || '',
      development_plan: ar.development_plan || '',
      strengths: ar.strengths || '',
      improvements: ar.improvements || '',
      recommend_promotion: !!ar.recommend_promotion,
      promotion_type: ar.promotion_type || '',
      recommend_increment: !!ar.recommend_increment,
      salary_revision: ar.salary_revision || '',
      role_change: ar.role_change || 'No Change',
      recommended_training: ar.recommended_training || '',
      high_potential: !!ar.high_potential,
      final_rating: ar.final_rating != null
        ? String(ar.final_rating)
        : (data.managerReview?.overall_rating != null ? String(data.managerReview.overall_rating) : ''),
    });
  }, [data]);

  const locked = data?.appraisal?.status !== 'under_admin_review'
    || data?.adminReview?.status === 'submitted';

  const mutation = useMutation({
    mutationFn: (payload) => appraisalApi.saveAdminReview(id, payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setConfirm(false);
      qc.invalidateQueries({ queryKey: ['admin-review', id] });
      qc.invalidateQueries({ queryKey: ['admin-queue'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      if (res.data.message?.toLowerCase().includes('submitted')) {
        navigate('/admin/approvals');
      }
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    const comps = data.competencies || [];
    const ratings = data.ratings || [];
    return comps.slice(0, 8).map((c) => {
      const emp = ratings.find((r) => r.rating_type === 'competency' && r.rated_by === 'employee' && String(r.reference_id) === String(c.id));
      const mgr = ratings.find((r) => r.rating_type === 'competency' && r.rated_by === 'manager' && String(r.reference_id) === String(c.id));
      return {
        name: c.name.length > 14 ? `${c.name.slice(0, 14)}…` : c.name,
        Employee: emp ? Number(emp.score) : 0,
        Manager: mgr ? Number(mgr.score) : 0,
      };
    }).filter((x) => x.Employee || x.Manager);
  }, [data]);

  if (isLoading) return <LoadingSkeleton rows={10} />;
  if (!data?.appraisal) {
    return <Alert severity="error">Appraisal not found</Alert>;
  }

  const a = data.appraisal;
  const profile = {
    name: a.employee_name,
    photo: a.profile_photo,
    employeeCode: a.employee_code,
    designation: a.designation,
    department: a.department_name,
    hireDate: a.hire_date,
    managerName: a.manager_name,
    cycleName: a.cycle_name,
    reviewPeriodStart: a.start_date,
    reviewPeriodEnd: a.end_date,
    dueDate: a.end_date,
    daysRemaining: null,
    status: a.status,
  };

  const selfAvg = Number(data.employeeSelf?.self_rating) || 0;
  const mgrAvg = Number(data.managerReview?.overall_rating) || 0;
  const summaryChart = [
    { name: 'Employee', score: selfAvg },
    { name: 'Manager', score: mgrAvg },
  ].filter((x) => x.score > 0);
  const progress = data.progress || 0;
  const stages = data.stages || [];

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <PageTransition>
      <PageHeader
        title="Admin Review"
        subtitle={a.cycle_name}
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Approvals', to: '/admin/approvals' },
          { label: a.employee_name },
        ]}
        action={<StatusChip status={a.status} />}
      />

      <DashboardProfileBanner profile={profile} />

      {/* Employee workflow progress */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={1.25}>
            <Typography variant="h6" fontWeight={700}>Appraisal Progress</Typography>
            <Typography variant="h5" fontWeight={800} color="primary.main">{progress}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 12, borderRadius: 999, mb: 1.75 }}
            color={progress >= 100 ? 'success' : 'primary'}
          />
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {stages.map((s) => (
              <Chip
                key={s.id}
                size="small"
                icon={s.done ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                label={s.label}
                color={s.done ? 'success' : 'default'}
                variant={s.done ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Always-visible employee vs manager bar graphs */}
      <Box mb={2.5}>
        <RatingComparisonChart chartData={chartData} summaryData={summaryChart} />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 1 }}>
        <Tab label="Employee Self Review" />
        <Tab label="Manager Review" />
        <Tab label="Recommendations" />
        <Tab label="Documents" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>Employee Self Review</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Self Rating</Typography>
                <StarScore value={selfAvg} showBadge />
              </Box>
              <Typography variant="subtitle2">Achievements</Typography>
              <Typography variant="body2">{data.employeeSelf?.achievements || '—'}</Typography>
              <Typography variant="subtitle2">Challenges</Typography>
              <Typography variant="body2">{data.employeeSelf?.challenges || '—'}</Typography>
              <Typography variant="subtitle2">Self Feedback</Typography>
              <Typography variant="body2">{data.employeeSelf?.self_feedback || '—'}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>Manager Review</Typography>
            {!data.managerReview ? (
              <Alert severity="info">Manager review not available</Alert>
            ) : (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Reviewed by {data.managerReview.manager_name || 'Manager'}
                </Typography>
                <StarScore value={mgrAvg} showBadge />
                <Typography variant="subtitle2">Comments</Typography>
                <Typography variant="body2">{data.managerReview.comments || '—'}</Typography>
                <Typography variant="subtitle2">Development Plan</Typography>
                <Typography variant="body2">{data.managerReview.development_plan || '—'}</Typography>
                <Stack direction="row" spacing={1}>
                  {!!data.managerReview.recommend_promotion && <Chip size="small" color="success" label="Promotion" />}
                  {!!data.managerReview.recommend_increment && <Chip size="small" color="info" label="Increment" />}
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Admin Comments & Recommendations</Typography>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12}>
                    <TextField
                      label="Overall Admin Comments"
                      multiline rows={3} fullWidth disabled={locked}
                      value={form.comments}
                      onChange={(e) => set('comments', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Development Plan / Training Recommendation"
                      multiline rows={2} fullWidth disabled={locked}
                      value={form.development_plan}
                      onChange={(e) => set('development_plan', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Strengths Observed"
                      multiline rows={2} fullWidth disabled={locked}
                      value={form.strengths}
                      onChange={(e) => set('strengths', e.target.value)}
                      placeholder="Comma-separated strengths"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Areas of Improvement"
                      multiline rows={2} fullWidth disabled={locked}
                      value={form.improvements}
                      onChange={(e) => set('improvements', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select fullWidth label="Promotion Recommendation" disabled={locked}
                      value={form.recommend_promotion ? 'yes' : 'no'}
                      onChange={(e) => set('recommend_promotion', e.target.value === 'yes')}
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="Promotion Type" disabled={locked || !form.recommend_promotion}
                      value={form.promotion_type}
                      onChange={(e) => set('promotion_type', e.target.value)}
                      placeholder="e.g. Senior Engineer"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select fullWidth label="Salary Revision" disabled={locked}
                      value={form.salary_revision}
                      onChange={(e) => {
                        set('salary_revision', e.target.value);
                        set('recommend_increment', !!e.target.value && e.target.value !== 'None');
                      }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="None">None</MenuItem>
                      <MenuItem value="5% - 10%">5% - 10%</MenuItem>
                      <MenuItem value="10% - 15%">10% - 15%</MenuItem>
                      <MenuItem value="15% - 20%">15% - 20%</MenuItem>
                      <MenuItem value="20%+">20%+</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select fullWidth label="Role Change Recommendation" disabled={locked}
                      value={form.role_change}
                      onChange={(e) => set('role_change', e.target.value)}
                    >
                      <MenuItem value="No Change">No Change</MenuItem>
                      <MenuItem value="Lateral Move">Lateral Move</MenuItem>
                      <MenuItem value="Cross-functional">Cross-functional</MenuItem>
                      <MenuItem value="Expanded Scope">Expanded Scope</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="Training Recommendation" disabled={locked}
                      value={form.recommended_training}
                      onChange={(e) => set('recommended_training', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth type="number" label="Final Rating (1-5)" disabled={locked}
                      inputProps={{ min: 1, max: 5, step: 0.1 }}
                      value={form.final_rating}
                      onChange={(e) => set('final_rating', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.high_potential}
                          disabled={locked}
                          onChange={(e) => set('high_potential', e.target.checked)}
                        />
                      }
                      label="High Potential Employee"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Recommendation Summary</Typography>
                <Stack spacing={1.25}>
                  <SummaryRow label="Promotion" value={form.recommend_promotion ? (form.promotion_type || 'Yes') : 'No'} />
                  <SummaryRow label="Salary Revision" value={form.salary_revision || '—'} />
                  <SummaryRow label="Role Change" value={form.role_change || '—'} />
                  <SummaryRow label="Training" value={form.recommended_training || '—'} />
                  <SummaryRow label="High Potential" value={form.high_potential ? 'Yes' : 'No'} />
                  <SummaryRow label="Final Rating" value={form.final_rating || '—'} />
                  <Divider sx={{ my: 1 }} />
                  {!locked && (
                    <Stack spacing={1}>
                      <Button
                        variant="outlined"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ ...form, submit: false })}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        variant="contained"
                        disabled={mutation.isPending}
                        startIcon={mutation.isPending ? <CircularProgress size={16} /> : null}
                        onClick={() => setConfirm(true)}
                      >
                        Submit to Leadership
                      </Button>
                    </Stack>
                  )}
                  {locked && <Alert severity="success">Admin review submitted</Alert>}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>Proof of Achievements</Typography>
            <Stack spacing={1}>
              {(data.documents || []).map((d) => (
                <Chip
                  key={d.id}
                  label={d.original_name}
                  component="a"
                  href={d.file_path}
                  target="_blank"
                  clickable
                  color="primary"
                  variant="outlined"
                />
              ))}
              {!data.documents?.length && (
                <Typography color="text.secondary">No documents uploaded</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <ConfirmDialog
        open={confirm}
        title="Submit Admin Approval?"
        message="This will send the appraisal to Leadership for final approval. Continue?"
        confirmText="Submit"
        onCancel={() => setConfirm(false)}
        onConfirm={() => mutation.mutate({ ...form, submit: true, final_rating: form.final_rating ? Number(form.final_rating) : null })}
        loading={mutation.isPending}
      />
    </PageTransition>
  );
}

function SummaryRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={700} textAlign="right">{value}</Typography>
    </Stack>
  );
}
