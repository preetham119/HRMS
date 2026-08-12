import { Grid, Card, CardContent, Typography, Button, Stack, Box, LinearProgress } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import {
  PageHeader, StatCard, LoadingSkeleton, PageTransition, DataTable,
  DashboardProfileBanner, WorkflowProgressBar,
} from '../../components/common';
function MiniProgress({ value }) {
  const p = Number(value) || 0;
  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography variant="caption" fontWeight={700} color={p >= 100 ? 'success.main' : 'primary.main'}>
        {p}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={p}
        color={p >= 100 ? 'success' : p >= 50 ? 'primary' : 'warning'}
        sx={{ height: 8, borderRadius: 999, mt: 0.35 }}
      />
    </Box>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardApi.admin().then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  if (isLoading) return <LoadingSkeleton rows={6} />;
  const d = data || {};

  return (
    <PageTransition>
      <PageHeader
        title="Admin performance overview"
        subtitle="Review employee & manager assessments and submit admin recommendations"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
      />

      <DashboardProfileBanner profile={d.profileBanner} />

      <WorkflowProgressBar progress={d.workflowProgress} role="admin" title="Your Progress" />

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Reviews" value={d.pendingCount || 0} icon={<PendingActionsIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed" value={d.completedCount || 0} icon={<DoneAllIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="High Potential" value={d.highPotentialCount || 0} icon={<StarIcon />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Promo Recommended" value={d.promoCount || 0} icon={<TrendingUpIcon />} color="primary" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700}>Awaiting Admin Review</Typography>
            <Button size="small" onClick={() => navigate('/admin/approvals')}>View all</Button>
          </Stack>
          <DataTable
            rows={d.queue || []}
            emptyTitle="No pending admin reviews"
            emptyDescription="Appraisals completed by managers will appear here."
            columns={[
              { id: 'employee_name', label: 'Employee' },
              { id: 'employee_code', label: 'Code' },
              { id: 'department_name', label: 'Department' },
              { id: 'cycle_name', label: 'Cycle' },
              {
                id: 'progress',
                label: 'Progress',
                render: (row) => <MiniProgress value={row.progress} />,
              },
              {
                id: 'rating',
                label: 'HR/Mgr Rating',
                render: (row) => (row.rating != null ? Number(row.rating).toFixed(1) : '—'),
              },
              {
                id: 'actions',
                label: 'Action',
                render: (row) => (
                  <Button size="small" variant="contained" onClick={() => navigate(`/admin/review/${row.id}`)}>
                    Review
                  </Button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </PageTransition>
  );
}
