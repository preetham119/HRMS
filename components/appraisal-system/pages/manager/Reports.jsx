import { useState } from 'react';
import {
  Card, CardContent, Typography, Grid, IconButton, Tooltip, Stack, Button,
  LinearProgress, Box,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { reportApi } from '../../services';
import {
  PageHeader, LoadingSkeleton, PageTransition, DataTable, StatusChip, AppraisalDetailDialog,
} from '../../components/common';

const COLORS = ['#1565C0', '#42A5F5', '#90CAF9', '#FFA726', '#EF5350'];

const chartCardSx = {
  height: '100%',
  borderRadius: '20px',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 2px 10px rgba(21,101,192,0.04)',
};

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

export default function ManagerReports() {
  const [selectedId, setSelectedId] = useState(null);

  const { data: team, isLoading } = useQuery({
    queryKey: ['team-perf'],
    queryFn: () => reportApi.team().then((r) => r.data.data),
  });
  const { data: dist } = useQuery({
    queryKey: ['rating-dist'],
    queryFn: () => reportApi.ratingDistribution().then((r) => r.data.data),
  });
  const { data: detail, isLoading: detailLoading, isError: detailError } = useQuery({
    queryKey: ['manager-appraisal-detail', selectedId],
    queryFn: () => reportApi.appraisalProgressDetail(selectedId).then((r) => {
      const payload = r.data?.data ?? r.data;
      if (!payload) throw new Error('Appraisal details not found');
      return payload;
    }),
    enabled: !!selectedId,
    retry: 1,
  });

  const openDetails = (row) => {
    const id = row?.appraisal_id || row?.id;
    if (!id) {
      toast.info('No appraisal started for this employee yet');
      return;
    }
    setSelectedId(id);
  };

  if (isLoading) return <LoadingSkeleton rows={6} />;

  const pieData = dist
    ? [
        { name: 'Outstanding', value: Number(dist.outstanding) || 0 },
        { name: 'Exceeds', value: Number(dist.exceeds) || 0 },
        { name: 'Meets', value: Number(dist.meets) || 0 },
        { name: 'Needs Imp.', value: Number(dist.needs) || 0 },
        { name: 'Unsatisfactory', value: Number(dist.unsatisfactory) || 0 },
      ].filter((x) => x.value > 0)
    : [];

  return (
    <PageTransition>
      <PageHeader
        title="Reports"
        subtitle="Team performance analytics — click a row or View details to open the full appraisal"
        breadcrumbs={[{ label: 'Manager', to: '/manager/dashboard' }, { label: 'Reports' }]}
      />
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card sx={chartCardSx}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Team Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={team || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="avg_progress" fill="#1565C0" name="Progress %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_rating" fill="#42A5F5" name="Rating" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={chartCardSx}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Rating Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            rows={team || []}
            emptyTitle="No team appraisals"
            emptyDescription="Team appraisal data will appear here once the cycle starts."
            onRowClick={openDetails}
            columns={[
              { id: 'name', label: 'Employee' },
              { id: 'employee_code', label: 'Code' },
              { id: 'designation', label: 'Designation' },
              {
                id: 'avg_progress',
                label: 'Progress',
                render: (r) => <MiniProgress value={r.avg_progress ?? r.progress} />,
              },
              {
                id: 'avg_rating',
                label: 'Rating',
                render: (r) => (r.avg_rating != null ? Number(r.avg_rating).toFixed(1) : '—'),
              },
              { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
              {
                id: 'action',
                label: 'Details',
                align: 'right',
                stopPropagation: true,
                render: (r) => (
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                    <Tooltip title="View details">
                      <span>
                        <IconButton size="small" onClick={() => openDetails(r)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Button size="small" variant="contained" onClick={() => openDetails(r)}>
                      View details
                    </Button>
                  </Stack>
                ),
              },
            ]}
          />
        </Grid>
      </Grid>

      <AppraisalDetailDialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        detail={detailError ? null : detail}
        loading={detailLoading}
      />
    </PageTransition>
  );
}
