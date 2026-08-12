import { Grid, Card, CardContent, Typography, Stack, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LoopIcon from '@mui/icons-material/Loop';
import BusinessIcon from '@mui/icons-material/Business';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { dashboardApi } from '../../services';
import { PageHeader, StatCard, LoadingSkeleton, PageTransition, DataTable, DashboardProfileBanner, StatusChip } from '../../components/common';
import { StarScore, PerformanceBadge } from '../../components/common/StarRating';

const COLORS = ['#1565C0', '#42A5F5', '#90CAF9', '#FFA726', '#EF5350'];

export default function HRDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['hr-dashboard'],
    queryFn: () => dashboardApi.hr().then((r) => r.data.data),
    refetchInterval: 45_000,
  });

  if (isLoading) return <LoadingSkeleton rows={8} />;
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
        title="Organization performance overview"
        subtitle="Track cycles, ratings, and appraisal progress across the organization"
        breadcrumbs={[{ label: 'HR' }, { label: 'Dashboard' }]}
      />

      <DashboardProfileBanner profile={d.profileBanner} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
          alignItems: 'stretch',
          '& > *': { minWidth: 0 },
        }}
      >
        <StatCard compact title="Employees" value={d.total_employees || 0} icon={<PeopleIcon />} />
        <StatCard compact title="Managers" value={d.total_managers || 0} icon={<SupervisorAccountIcon />} color="info" />
        <StatCard compact title="Departments" value={d.total_departments || 0} icon={<BusinessIcon />} color="secondary" />
        <StatCard compact title="In Progress" value={d.pending_approvals || 0} icon={<HourglassEmptyIcon />} color="warning" />
        <StatCard compact title="Completed" value={d.completed_appraisals || 0} icon={<DoneAllIcon />} color="success" />
        <StatCard compact title="Active Cycles" value={d.active_cycles || 0} icon={<LoopIcon />} color="info" />
      </Box>

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Workflow pipeline</Typography>
              <Typography variant="h6" fontWeight={700}>
                Employee → Manager → Admin → CEO
              </Typography>
            </Box>
            {d.topPerformers?.[0]?.rating != null && (
              <Stack spacing={0.5} alignItems={{ sm: 'flex-end' }}>
                <Typography variant="caption" color="text.secondary">Top performer rating</Typography>
                <PerformanceBadge value={d.topPerformers[0].rating} />
              </Stack>
            )}
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
              gap: 1.5,
            }}
          >
            {[
              { label: 'Self Appraisal', value: d.stageCounts?.self_pending || 0 },
              { label: 'Manager Review', value: d.stageCounts?.manager_pending || 0 },
              { label: 'Admin Review', value: d.stageCounts?.admin_pending || 0 },
              { label: 'CEO Review', value: d.stageCounts?.leadership_pending || 0 },
              { label: 'Completed', value: d.stageCounts?.completed || 0 },
            ].map((stage) => (
              <Box
                key={stage.label}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="caption" color="text.secondary">{stage.label}</Typography>
                <Typography variant="h5" fontWeight={800}>{stage.value}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {!!d.pipeline?.length && (
        <Card sx={{ mb: 2.5 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1.5}>Live status tracker</Typography>
            <DataTable
              rows={d.pipeline}
              columns={[
                { id: 'employee_name', label: 'Employee' },
                { id: 'department', label: 'Department' },
                { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
                { id: 'progress', label: 'Progress', render: (r) => `${r.progress || 0}%` },
                {
                  id: 'rating',
                  label: 'Rating',
                  render: (r) => (r.rating != null ? <StarScore value={r.rating} showBadge /> : '—'),
                },
              ]}
              emptyTitle="No appraisals yet"
              emptyDescription="Open an appraisal cycle to start tracking."
            />
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Department Performance</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.departmentPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avg_rating" fill="#1565C0" name="Avg Rating" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Rating Distribution</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Stage Volume</Typography>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={d.monthlyAppraisals || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1565C0" strokeWidth={3} name="Count" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Top Performers</Typography>
              <DataTable
                rows={d.topPerformers || []}
                columns={[
                  { id: 'name', label: 'Employee' },
                  { id: 'designation', label: 'Role' },
                  { id: 'department', label: 'Dept' },
                  {
                    id: 'rating',
                    label: 'Rating',
                    render: (r) => <StarScore value={r.rating} showBadge />,
                  },
                ]}
                emptyTitle="No ratings yet"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
