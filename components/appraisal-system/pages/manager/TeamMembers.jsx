import { useState } from 'react';
import {
  Avatar, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, MenuItem, Box, LinearProgress, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { employeeApi, goalApi, appraisalApi } from '../../services';
import { PageHeader, DataTable, SearchField, StatusChip, PageTransition } from '../../components/common';
import { formatDate } from '../../utils/helpers';

export default function TeamMembers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [goalDialog, setGoalDialog] = useState(null);
  const [detail, setDetail] = useState(null);
  const [goalForm, setGoalForm] = useState({
    goal_name: '', description: '', kpi: '', weightage: 25, start_date: '', end_date: '', cycle_id: '',
  });
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['team', search, page, limit],
    queryFn: () => employeeApi.list({ search, page: page + 1, limit }).then((r) => r.data),
  });

  const { data: cycles } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => appraisalApi.cycles({ status: 'open' }).then((r) => r.data.data),
  });

  const createGoal = useMutation({
    mutationFn: (payload) => goalApi.create(payload),
    onSuccess: () => {
      toast.success('Goal assigned');
      setGoalDialog(null);
      qc.invalidateQueries(['team']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const openDetail = async (id) => {
    const { data: res } = await employeeApi.get(id);
    setDetail(res.data);
  };

  return (
    <PageTransition>
      <PageHeader
        title="Team Members"
        subtitle="View your team, goals, and previous reviews"
        breadcrumbs={[{ label: 'Manager', to: '/manager/dashboard' }, { label: 'Team Members' }]}
        action={<SearchField value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Search team..." />}
      />

      <DataTable
        loading={isLoading}
        rows={data?.data || []}
        page={page}
        rowsPerPage={limit}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        onRowsPerPageChange={(v) => { setLimit(v); setPage(0); }}
        columns={[
          {
            id: 'name',
            label: 'Employee',
            render: (r) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar src={r.profile_photo} sx={{ width: 36, height: 36 }}>{r.first_name?.[0]}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{r.first_name} {r.last_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{r.email}</Typography>
                </Box>
              </Stack>
            ),
          },
          { id: 'employee_code', label: 'Code' },
          { id: 'designation', label: 'Designation' },
          { id: 'department_name', label: 'Department' },
          {
            id: 'actions',
            label: 'Actions',
            render: (r) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => openDetail(r.id)}>View</Button>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => {
                  setGoalDialog(r);
                  setGoalForm((f) => ({ ...f, cycle_id: cycles?.[0]?.id || '' }));
                }}>
                  Goal
                </Button>
              </Stack>
            ),
          },
        ]}
      />

      <Dialog open={!!goalDialog} onClose={() => setGoalDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Goal — {goalDialog?.first_name} {goalDialog?.last_name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5} alignItems="flex-start">
            <Grid item xs={12}>
              <TextField
                label="Goal Name"
                fullWidth
                value={goalForm.goal_name}
                onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="KPI"
                fullWidth
                value={goalForm.kpi}
                onChange={(e) => setGoalForm({ ...goalForm, kpi: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Weightage %"
                type="number"
                fullWidth
                value={goalForm.weightage}
                onChange={(e) => setGoalForm({ ...goalForm, weightage: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Cycle"
                fullWidth
                value={goalForm.cycle_id}
                onChange={(e) => setGoalForm({ ...goalForm, cycle_id: e.target.value })}
              >
                {(cycles || []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={goalForm.start_date}
                onChange={(e) => setGoalForm({ ...goalForm, start_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={goalForm.end_date}
                onChange={(e) => setGoalForm({ ...goalForm, end_date: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => createGoal.mutate({ ...goalForm, employee_id: goalDialog.id })} disabled={createGoal.isPending}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth>
        <DialogTitle>{detail?.first_name} {detail?.last_name}</DialogTitle>
        <DialogContent>
          {detail && (
            <Stack spacing={2}>
              <Typography variant="body2">{detail.designation} · {detail.employee_code} · {detail.department_name}</Typography>
              <Typography variant="subtitle1" fontWeight={700}>Goals</Typography>
              {(detail.goals || []).map((g) => (
                <Box key={g.id}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600}>{g.goal_name}</Typography>
                    <StatusChip status={g.status} />
                  </Stack>
                  <LinearProgress variant="determinate" value={Number(g.progress)} sx={{ mt: 0.5, mb: 0.5, height: 6, borderRadius: 3 }} />
                </Box>
              ))}
              <Typography variant="subtitle1" fontWeight={700}>Previous Reviews</Typography>
              {(detail.reviews || []).map((r) => (
                <Stack key={r.id} direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={r.cycle_name} />
                  <StatusChip status={r.status} />
                  <Typography variant="body2">Rating: {r.final_rating || r.overall_rating || '—'}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageTransition>
  );
}
