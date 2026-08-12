import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, LinearProgress, Skeleton, Stack, Typography, Tooltip,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers';

function StageIcon({ done, label }) {
  return (
    <Tooltip title={label}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', color: done ? 'success.main' : 'text.disabled' }}>
        {done ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
      </Box>
    </Tooltip>
  );
}

function DetailStatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={STATUS_LABELS[status] || status}
      color={STATUS_COLORS[status] || 'default'}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}

/**
 * Shared appraisal detail dialog for Reports (HR / Manager) and similar read-only views.
 */
export default function AppraisalDetailDialog({
  open,
  onClose,
  detail,
  loading,
  onDownloadPdf,
}) {
  const appraisal = detail?.appraisal || {};
  const stages = detail?.stages || [];
  const progress = Number(detail?.progress) || 0;
  const hrReview = detail?.hrReview || detail?.adminReview || null;
  const managerReview = detail?.managerReview || null;
  const leadershipReview = detail?.leadershipReview || null;
  const documents = detail?.documents || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Appraisal Details</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={48} />
            ))}
          </Stack>
        )}
        {!loading && !detail && (
          <Typography color="text.secondary" py={2}>
            Unable to load appraisal details.
          </Typography>
        )}
        {!loading && detail && (
          <Stack spacing={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>{appraisal.employee_name || '—'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {[appraisal.employee_code, appraisal.designation, appraisal.department_name || appraisal.department]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manager: {appraisal.manager_name || '—'} · Cycle: {appraisal.cycle_name || '—'}
                </Typography>
              </Box>
              <DetailStatusChip status={appraisal.status} />
            </Stack>

            <Box>
              <Typography variant="subtitle2" mb={0.75} fontWeight={700}>
                Workflow Progress — {progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={progress >= 100 ? 'success' : progress >= 50 ? 'primary' : 'warning'}
                sx={{ height: 10, borderRadius: 999, mb: 1.25 }}
              />
              <Stack spacing={0.75}>
                {stages.map((s) => (
                  <Stack key={s.id} direction="row" spacing={1} alignItems="center">
                    <StageIcon done={s.done} label={s.label} />
                    <Typography variant="body2" fontWeight={s.done ? 600 : 400}>
                      {s.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.date ? formatDate(s.date) : s.done ? 'Completed' : 'Pending'}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Self Evaluation</Typography>
            <Typography variant="body2">Rating: {appraisal.self_rating ?? '—'}</Typography>
            <Typography variant="body2"><strong>Achievements:</strong> {appraisal.achievements || '—'}</Typography>
            <Typography variant="body2"><strong>Challenges:</strong> {appraisal.challenges || '—'}</Typography>
            <Typography variant="body2"><strong>Feedback:</strong> {appraisal.self_feedback || '—'}</Typography>

            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Manager Review</Typography>
            {managerReview ? (
              <>
                <Typography variant="body2">Rating: {managerReview.overall_rating ?? '—'}</Typography>
                <Typography variant="body2">{managerReview.comments || '—'}</Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            )}

            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Admin Review</Typography>
            {hrReview ? (
              <>
                <Typography variant="body2">Rating: {hrReview.final_rating ?? '—'}</Typography>
                <Typography variant="body2">{hrReview.comments || '—'}</Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            )}

            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Leadership Review</Typography>
            {leadershipReview ? (
              <>
                <Typography variant="body2">Rating: {leadershipReview.final_rating ?? '—'}</Typography>
                <Typography variant="body2">{leadershipReview.comments || '—'}</Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            )}

            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>Proof of Achievements</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {documents.map((d) => (
                <Chip
                  key={d.id}
                  label={d.original_name || d.name || 'Document'}
                  component="a"
                  href={d.file_path || '#'}
                  target="_blank"
                  clickable
                  size="small"
                />
              ))}
              {!documents.length && (
                <Typography variant="body2" color="text.secondary">No documents</Typography>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        {onDownloadPdf && (
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            disabled={loading || !detail}
            onClick={onDownloadPdf}
          >
            Download PDF
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
