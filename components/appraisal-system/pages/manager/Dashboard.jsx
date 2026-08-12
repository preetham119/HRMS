import { Grid, Card, CardContent, Typography, Avatar, Stack, Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StarIcon from '@mui/icons-material/Star';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader, StatCard, StatusChip, LoadingSkeleton, PageTransition, DataTable, WorkflowProgressBar, DashboardProfileBanner } from '../../components/common';
import { StarScore, PerformanceBadge } from '../../components/common/StarRating';
import { formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = ['#1565C0', '#42A5F5', '#90CAF9', '#FFA726', '#EF5350'];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: () => dashboardApi.manager().then((r) => r.data.data),
    refetchInterval: 45_000,
  });

  if (isLoading) return <LoadingSkeleton rows={6} />;
  const d = data || {};
  const dist = d.ratingDistribution || {};
  const pieData = [
    { name: 'Outstanding', value: Number(dist.outstanding) || 0 },
    { name: 'Exceeds', value: Number(dist.exceeds) || 0 },
    { name: 'Meets', value: Number(dist.meets) || 0 },
    { name: 'Needs Imp.', value: Number(dist.needs) || 0 },
    { name: 'Unsatisfactory', value: Number(dist.unsatisfactory) || 0 },
  ].filter((x) => x.value > 0);

  return (
    <PageTransition>
      <PageHeader
        title="Team performance overview"
        subtitle="Team performance and review overview"
        breadcrumbs={[{ label: 'Manager' }, { label: 'Dashboard' }]}
      />

      <DashboardProfileBanner profile={d.profileBanner} />

      <WorkflowProgressBar progress={d.workflowProgress} role="manager" title="Your Progress" />

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Team Members" value={d.teamCount || 0} icon={<GroupsIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Reviews" value={d.pendingCount || 0} icon={<RateReviewIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed Reviews" value={d.completedCount || 0} icon={<DoneAllIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Team Rating"
            value={d.averageRating ? `${Number(d.averageRating).toFixed(1)}★` : '—'}
            icon={<StarIcon />}
            color="info"
            subtitle={d.averageRating ? undefined : 'No ratings yet'}
          />
        </Grid>
      </Grid>

      {!!d.averageRating && (
        <Box mb={2.5}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Team Performance Band</Typography>
                  <PerformanceBadge value={d.averageRating} large />
                </Box>
                <StarScore value={d.averageRating} showBadge />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Team Performance</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.teamPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="avg_progress" fill="#1565C0" name="Goal Progress %" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avg_rating" fill="#42A5F5" name="Avg Rating" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Rating Distribution</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Pending Reviews</Typography>
              <DataTable
                columns={[
                  { id: 'employee_name', label: 'Employee' },
                  { id: 'employee_code', label: 'Code' },
                  { id: 'cycle_name', label: 'Cycle' },
                  { id: 'submitted_at', label: 'Submitted', render: (r) => formatDate(r.submitted_at) },
                  { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
                  {
                    id: 'action',
                    label: 'Action',
                    render: (r) => (
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => navigate(`/manager/review/${r.id}`)}
                      >
                        Review
                      </Typography>
                    ),
                  },
                ]}
                rows={d.pendingReviews || []}
                emptyTitle="No pending reviews"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
