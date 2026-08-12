import { Card, CardContent, Typography, Grid, Stack, Box, Divider, Rating } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { appraisalApi } from '../../services';
import { PageHeader, LoadingSkeleton, EmptyState, PageTransition } from '../../components/common';
import { PerformanceBadge, StarScore } from '../../components/common/StarRating';
import { ratingLabel } from '../../utils/helpers';

export default function Feedback() {
  const { data, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => appraisalApi.feedback().then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSkeleton />;
  const rows = data || [];

  return (
    <PageTransition>
      <PageHeader
        title="Feedback"
        subtitle="Final ratings, manager & HR feedback, and development plans"
        breadcrumbs={[{ label: 'Employee', to: '/employee/dashboard' }, { label: 'Feedback' }]}
      />
      {!rows.length ? (
        <EmptyState title="No published feedback" description="Feedback appears after HR publishes your final appraisal result." />
      ) : (
        <Grid container spacing={2.5}>
          {rows.map((r) => {
            const overall = r.final_rating || r.manager_rating;
            return (
              <Grid item xs={12} key={r.id}>
                <Card>
                  <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={2} spacing={1}>
                      <Typography variant="h6" fontWeight={700}>{r.cycle_name}</Typography>
                      <PerformanceBadge value={overall} />
                    </Stack>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ opacity: 0.85 }}>Overall Rating</Typography>
                          <Typography variant="h3" fontWeight={700}>{overall ? Number(overall).toFixed(1) : '—'}</Typography>
                          <Rating
                            value={Number(overall) || 0}
                            precision={0.5}
                            readOnly
                            sx={{
                              '& .MuiRating-iconFilled': { color: '#FFD54F' },
                              '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.35)' },
                            }}
                          />
                          <Typography variant="body2" mt={0.5}>{ratingLabel(overall)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Manager Rating</Typography>
                            <StarScore value={r.manager_rating} showBadge />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Manager Feedback</Typography>
                            <Typography variant="body2">{r.manager_comments || '—'}</Typography>
                          </Box>
                          <Divider />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">HR Feedback</Typography>
                            <Typography variant="body2">{r.hr_comments || '—'}</Typography>
                          </Box>
                          <Divider />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Development Plan</Typography>
                            <Typography variant="body2">{r.development_plan || r.manager_dev_plan || '—'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">Recommended Training</Typography>
                            <Typography variant="body2">{r.recommended_training || r.recommend_training || '—'}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </PageTransition>
  );
}
