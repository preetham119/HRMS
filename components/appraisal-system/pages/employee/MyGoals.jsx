import { useState } from 'react';
import {
  Card, CardContent, Typography, Stack, Box, LinearProgress, Slider, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { goalApi } from '../../services';
import { PageHeader, StatusChip, LoadingSkeleton, EmptyState, PageTransition } from '../../components/common';
import { formatDate } from '../../utils/helpers';

export default function MyGoals() {
  const qc = useQueryClient();
  const [editGoal, setEditGoal] = useState(null);
  const [progress, setProgress] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['my-goals'],
    queryFn: () => goalApi.list({ limit: 50 }).then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, progress }) => goalApi.update(id, { progress }),
    onSuccess: () => {
      toast.success('Progress updated');
      qc.invalidateQueries(['my-goals']);
      qc.invalidateQueries(['employee-dashboard']);
      setEditGoal(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  if (isLoading) return <LoadingSkeleton />;
  const goals = data?.data || [];

  return (
    <PageTransition>
      <PageHeader
        title="My Goals"
        subtitle="Track and update progress on your assigned goals"
        breadcrumbs={[{ label: 'Employee', to: '/employee/dashboard' }, { label: 'My Goals' }]}
      />

      {!goals.length ? (
        <EmptyState title="No goals assigned" description="Your manager will assign goals for the current cycle." />
      ) : (
        <Grid container spacing={2.5}>
          {goals.map((g) => (
            <Grid item xs={12} md={6} key={g.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontWeight={700}>{g.goal_name}</Typography>
                    <StatusChip status={g.status} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={2}>{g.description}</Typography>
                  <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={`Weight: ${g.weightage}%`} color="primary" variant="outlined" />
                    <Chip size="small" label={`KPI: ${g.kpi || '—'}`} variant="outlined" />
                  </Stack>
                  <Box mb={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>Progress</Typography>
                      <Typography variant="body2">{g.progress}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={Number(g.progress)} sx={{ height: 10, borderRadius: 5, mt: 0.5 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    {formatDate(g.start_date)} → {formatDate(g.end_date)}
                    {g.cycle_name ? ` · ${g.cycle_name}` : ''}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => { setEditGoal(g); setProgress(Number(g.progress)); }}
                  >
                    Update Progress
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!editGoal} onClose={() => setEditGoal(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Goal Progress</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>{editGoal?.goal_name}</Typography>
          <Typography gutterBottom>Completion: {progress}%</Typography>
          <Slider value={progress} onChange={(_, v) => setProgress(v)} valueLabelDisplay="auto" step={5} marks min={0} max={100} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGoal(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => mutation.mutate({ id: editGoal.id, progress })}
            disabled={mutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageTransition>
  );
}
