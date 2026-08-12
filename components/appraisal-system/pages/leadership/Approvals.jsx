import { useState } from 'react';
import { Button, MenuItem, Stack, TextField, Box, Typography, LinearProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { appraisalApi } from '../../services';
import { PageHeader, DataTable, StatusChip, PageTransition, SearchField } from '../../components/common';

function MiniProgress({ value }) {
  const p = Number(value) || 0;
  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography variant="caption" fontWeight={700}>{p}%</Typography>
      <LinearProgress
        variant="determinate"
        value={p}
        color={p >= 100 ? 'success' : p >= 50 ? 'primary' : 'warning'}
        sx={{ height: 8, borderRadius: 999, mt: 0.35 }}
      />
    </Box>
  );
}

export default function LeadershipApprovals() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['leadership-queue', page, search, status],
    queryFn: () =>
      appraisalApi.leadershipQueue({
        page: page + 1,
        limit: 10,
        search,
        status,
      }).then((r) => r.data),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  return (
    <PageTransition>
      <PageHeader
        title="Leadership Approvals"
        subtitle="Review employee & manager assessments and submit recommendations"
        breadcrumbs={[{ label: 'Leadership', to: '/leadership/dashboard' }, { label: 'Approvals' }]}
        action={
          <Stack direction="row" spacing={1}>
            <SearchField value={search} onChange={(v) => { setSearch(v); setPage(0); }} />
            <TextField select size="small" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ minWidth: 140 }}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="">All</MenuItem>
            </TextField>
          </Stack>
        }
      />

      <DataTable
        loading={isLoading}
        rows={data?.data || []}
        page={page}
        rowsPerPage={10}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        emptyTitle="No appraisals in queue"
        emptyDescription="Appraisals awaiting leadership approval will appear here."
        onRowClick={(r) => navigate(`/leadership/review/${r.id}`)}
        columns={[
          { id: 'employee_name', label: 'Employee' },
          { id: 'employee_code', label: 'Code' },
          { id: 'department_name', label: 'Department' },
          { id: 'cycle_name', label: 'Cycle' },
          {
            id: 'progress',
            label: 'Progress',
            render: (r) => <MiniProgress value={r.progress} />,
          },
          {
            id: 'manager_rating',
            label: 'Manager',
            render: (r) => (r.manager_rating != null ? Number(r.manager_rating).toFixed(1) : '—'),
          },
          {
            id: 'hr_rating',
            label: 'HR',
            render: (r) => (r.hr_rating != null ? Number(r.hr_rating).toFixed(1) : '—'),
          },
          { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
          {
            id: 'actions',
            label: 'Details',
            stopPropagation: true,
            render: (r) => (
              <Button size="small" variant="contained" onClick={() => navigate(`/leadership/review/${r.id}`)}>
                View details
              </Button>
            ),
          },
        ]}
      />
    </PageTransition>
  );
}
