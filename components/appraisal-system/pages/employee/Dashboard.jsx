import { Grid, Card, CardContent, Typography, Stack, Avatar, LinearProgress, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts';
import { dashboardApi, appraisalApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader, StatCard, StatusChip, LoadingSkeleton, PageTransition, WorkflowProgressBar, DashboardProfileBanner } from '../../components/common';
import { PerformanceBadge } from '../../components/common/StarRating';
import { formatDate } from '../../utils/helpers';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: () => dashboardApi.employee().then((r) => r.data.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  const { data: feedback } = useQuery({
    queryKey: ['feedback-preview'],
    queryFn: () => appraisalApi.feedback().then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSkeleton rows={6} />;
  const d = data || {};
  const goals = d.goals || [];
  const chartData = goals.map((g) => ({ name: g.goal_name?.slice(0, 18), progress: Number(g.progress) }));
  const latestFeedback = (feedback || [])[0];

  return (
    <PageTransition>
      <PageHeader
        title="Performance overview"
        subtitle="Track your goals, ratings, and appraisal progress"
        breadcrumbs={[{ label: 'Employee' }, { label: 'Dashboard' }]}
      />

      <DashboardProfileBanner profile={d.profileBanner} />

      <WorkflowProgressBar progress={d.workflowProgress} role="employee" title="Your Progress" />

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Assigned Goals" value={goals.length} icon={<FlagIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Goal Progress" value={`${d.goalProgress || 0}%`} icon={<TrendingUpIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming Reviews" value={d.upcomingReviews?.length || 0} icon={<EventIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Self Rating" value={d.appraisalStatus?.self_rating ? `${Number(d.appraisalStatus.self_rating).toFixed(1)}★` : '—'} icon={<StarIcon />} color="info" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Goal Completion</Typography>
              {chartData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#1565C0" radius={[6, 6, 0, 0]} name="Progress %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No goals assigned yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Manager</Typography>
              {d.manager ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={d.manager.profile_photo} sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                    {d.manager.first_name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700}>{d.manager.first_name} {d.manager.last_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{d.manager.designation}</Typography>
                    <Typography variant="caption" color="text.secondary">{d.manager.email}</Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">No manager assigned</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1}>Recent Notifications</Typography>
              <List dense>
                {(d.notifications || []).slice(0, 4).map((n, i) => (
                  <Box key={n.id}>
                    <ListItem disableGutters>
                      <ListItemText
                        primary={n.title}
                        secondary={n.message}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    {i < 3 && <Divider />}
                  </Box>
                ))}
                {!d.notifications?.length && <Typography variant="body2" color="text.secondary">No notifications</Typography>}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {latestFeedback && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} mb={1}>
                  <Typography variant="h6" fontWeight={700}>Latest Manager Feedback</Typography>
                  <PerformanceBadge value={latestFeedback.final_rating || latestFeedback.manager_rating} />
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1}>{latestFeedback.cycle_name}</Typography>
                <Typography variant="body2">{latestFeedback.manager_comments || latestFeedback.hr_comments || 'No written feedback yet.'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Assigned Goals</Typography>
              <Stack spacing={2}>
                {goals.map((g) => (
                  <Box key={g.id}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight={600}>{g.goal_name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StatusChip status={g.status} />
                        <Typography variant="body2">{g.progress}%</Typography>
                      </Stack>
                    </Stack>
                    <LinearProgress variant="determinate" value={Number(g.progress)} sx={{ height: 8, borderRadius: 4 }} />
                    <Typography variant="caption" color="text.secondary">
                      Weight: {g.weightage}% · Due: {formatDate(g.end_date)} · KPI: {g.kpi || '—'}
                    </Typography>
                  </Box>
                ))}
                {!goals.length && <Typography color="text.secondary">No goals assigned.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
