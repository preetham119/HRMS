import { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  MenuItem, Typography, Box, Divider, Grid, Chip,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { appraisalApi } from '../../services';
import { PageHeader, DataTable, SearchField, StatusChip, LoadingSkeleton, PageTransition } from '../../components/common';
import { formatDate } from '../../utils/helpers';
import { StarRating, StarScore, PerformanceBadge } from '../../components/common/StarRating';

export default function Approvals() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({
    action: 'approve',
    final_rating: '',
    comments: '',
    development_plan: '',
    recommended_training: '',
  });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', search, status, page],
    queryFn: () => appraisalApi.approvals({ search, status, page: page + 1, limit: 10 }).then((r) => r.data),
  });

  const openReview = async (row) => {
    const { data: res } = await appraisalApi.get(row.id);
    setDetail(res.data);
    setSelected(row);
    setForm({
      action: 'approve',
      final_rating: res.data.managerReview?.overall_rating || '',
      comments: '',
      development_plan: res.data.managerReview?.development_plan || '',
      recommended_training: res.data.managerReview?.recommend_training || '',
    });
  };

  const mutation = useMutation({
    mutationFn: (payload) => appraisalApi.hrReview(selected.id, payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setSelected(null);
      setDetail(null);
      qc.invalidateQueries(['approvals']);
      qc.invalidateQueries(['hr-dashboard']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <PageTransition>
      <PageHeader
        title="Approvals"
        subtitle="Review manager evaluations and send approved appraisals to Admin"
        breadcrumbs={[{ label: 'HR', to: '/hr/dashboard' }, { label: 'Approvals' }]}
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
        emptyTitle="No approvals pending"
        columns={[
          { id: 'employee_name', label: 'Employee' },
          { id: 'employee_code', label: 'Code' },
          { id: 'department_name', label: 'Department' },
          { id: 'cycle_name', label: 'Cycle' },
          { id: 'manager_rating', label: 'Manager Rating', render: (r) => <StarScore value={r.manager_rating} /> },
          { id: 'final_rating', label: 'Final', render: (r) => <StarScore value={r.final_rating} showBadge /> },
          { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
          {
            id: 'actions',
            label: 'Actions',
            render: (r) => (
              <Button size="small" variant="contained" onClick={() => openReview(r)} disabled={r.status === 'completed' && r.hr_status === 'published'}>
                Review
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>HR Review — {selected?.employee_name}</DialogTitle>
        <DialogContent>
          {detail ? (
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Self Appraisal</Typography>
                <Typography variant="body2" mb={1}>{detail.appraisal.achievements}</Typography>
                <Typography variant="subtitle2" color="text.secondary">Manager Comments</Typography>
                <Typography variant="body2" mb={1}>{detail.managerReview?.comments || '—'}</Typography>
                <Stack spacing={1} mt={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Goal Score</Typography>
                    <StarScore value={detail.managerReview?.goal_score} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Competency Score</Typography>
                    <StarScore value={detail.managerReview?.competency_score} />
                  </Box>
                  <PerformanceBadge value={detail.managerReview?.overall_rating} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {!!detail.managerReview?.recommend_promotion && <Chip size="small" color="success" label="Promotion" />}
                    {!!detail.managerReview?.recommend_increment && <Chip size="small" color="info" label="Increment" />}
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <TextField
                    select label="Action" fullWidth value={form.action}
                    onChange={(e) => setForm({ ...form, action: e.target.value })}
                  >
                    <MenuItem value="approve">Approve</MenuItem>
                    <MenuItem value="reject">Reject</MenuItem>
                    <MenuItem value="return">Return for Correction</MenuItem>
                    <MenuItem value="publish">Send to Admin</MenuItem>
                  </TextField>
                  <StarRating
                    label="Final Rating"
                    value={Number(form.final_rating) || 0}
                    onChange={(v) => setForm({ ...form, final_rating: v })}
                    precision={0.5}
                  />
                  <TextField label="HR Comments" multiline rows={2} fullWidth value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
                  <TextField label="Development Plan" multiline rows={2} fullWidth value={form.development_plan} onChange={(e) => setForm({ ...form, development_plan: e.target.value })} />
                  <TextField label="Recommended Training" fullWidth value={form.recommended_training} onChange={(e) => setForm({ ...form, recommended_training: e.target.value })} />
                </Stack>
              </Grid>
            </Grid>
          ) : <LoadingSkeleton rows={3} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    </PageTransition>
  );
}
