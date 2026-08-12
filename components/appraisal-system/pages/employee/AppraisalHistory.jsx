import { Card, CardContent, Typography, Stack, Grid, Divider, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { appraisalApi } from '../../services';
import { PageHeader, StatusChip, LoadingSkeleton, EmptyState, PageTransition } from '../../components/common';
import { formatDate, ratingLabel } from '../../utils/helpers';

export default function AppraisalHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['appraisal-history'],
    queryFn: () => appraisalApi.history().then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSkeleton />;
  const rows = data || [];

  return (
    <PageTransition>
      <PageHeader
        title="Appraisal History"
        subtitle="Previous appraisal cycles and outcomes"
        breadcrumbs={[{ label: 'Employee', to: '/employee/dashboard' }, { label: 'Appraisal History' }]}
      />
      {!rows.length ? (
        <EmptyState title="No appraisal history" description="Completed appraisals will appear here." />
      ) : (
        <Grid container spacing={2.5}>
          {rows.map((r) => (
            <Grid item xs={12} key={r.id}>
              <Card>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{r.cycle_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(r.start_date)} — {formatDate(r.end_date)}
                      </Typography>
                    </Box>
                    <StatusChip status={r.status} />
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Self Rating</Typography>
                      <Typography fontWeight={700}>{r.self_rating || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Manager Rating</Typography>
                      <Typography fontWeight={700}>{r.manager_rating || '—'} {r.manager_rating ? `(${ratingLabel(r.manager_rating)})` : ''}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Final Rating</Typography>
                      <Typography fontWeight={700} color="primary.main">{r.final_rating || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Submitted</Typography>
                      <Typography fontWeight={600}>{formatDate(r.submitted_at)}</Typography>
                    </Grid>
                    {r.manager_comments && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary">Manager Comments</Typography>
                        <Typography variant="body2">{r.manager_comments}</Typography>
                      </Grid>
                    )}
                    {r.hr_comments && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="text.secondary">HR Comments</Typography>
                        <Typography variant="body2">{r.hr_comments}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </PageTransition>
  );
}
