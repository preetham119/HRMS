import { Box, Stack, Typography, Rating, TextField, Chip, Card, CardContent } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { motion } from 'framer-motion';
import { ratingLabel, ratingBadgeColor, formatStars } from '../../utils/helpers';

/** Interactive MUI star rating with label */
export function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'large',
  precision = 0.5,
  showLabel = true,
  showValue = true,
  label,
}) {
  const v = Number(value) || 0;
  return (
    <Stack spacing={0.5} alignItems={readOnly ? 'flex-start' : 'stretch'}>
      {label && (
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      )}
      <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
        <Box
          component={motion.div}
          whileHover={readOnly ? undefined : { scale: 1.02 }}
          sx={{
            display: 'inline-flex',
            '& .MuiRating-iconFilled': { color: '#F9A825' },
            '& .MuiRating-iconHover': { color: '#F57F17' },
            '& .MuiRating-iconEmpty': { color: 'action.disabled' },
          }}
        >
          <Rating
            value={v}
            precision={precision}
            readOnly={readOnly}
            size={size}
            onChange={(_, next) => {
              if (!readOnly && onChange) onChange(next || 0);
            }}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
            icon={<StarIcon fontSize="inherit" />}
          />
        </Box>
        {showValue && (
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {v > 0 ? `${v.toFixed(precision === 1 ? 0 : 1)}/5` : '—'}
          </Typography>
        )}
        {showLabel && v > 0 && (
          <Chip
            size="small"
            label={ratingLabel(v)}
            color={ratingBadgeColor(v)}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>
    </Stack>
  );
}

/** Compact display of rating as stars + number */
export function StarScore({ value, size = 'small', showBadge = false }) {
  const v = Number(value) || 0;
  if (!v) return <Typography variant="body2" color="text.secondary">—</Typography>;
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Rating
        value={v}
        precision={0.5}
        readOnly
        size={size}
        sx={{ '& .MuiRating-iconFilled': { color: '#F9A825' } }}
      />
      <Typography variant="body2" fontWeight={700}>
        {v.toFixed(1)}/5
      </Typography>
      {showBadge && (
        <Chip size="small" label={ratingLabel(v)} color={ratingBadgeColor(v)} sx={{ fontWeight: 600, height: 22 }} />
      )}
    </Stack>
  );
}

/** Performance summary badge */
export function PerformanceBadge({ value, large = false }) {
  const v = Number(value) || 0;
  if (!v) return null;
  const color = ratingBadgeColor(v);
  return (
    <Chip
      icon={<StarIcon />}
      label={`${formatStars(v)} ${v.toFixed(1)} — ${ratingLabel(v)}`}
      color={color}
      sx={{
        fontWeight: 700,
        px: large ? 1 : 0.5,
        py: large ? 2.5 : 0,
        fontSize: large ? 14 : 12,
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  );
}

/** Competency card with stars + optional comment */
export function CompetencyRatingCard({
  name,
  description,
  value,
  comment,
  onChange,
  onCommentChange,
  readOnly = false,
  highlight = false,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: 'box-shadow .2s, border-color .2s, transform .2s',
        borderColor: value ? 'primary.light' : 'divider',
        bgcolor: highlight ? 'action.hover' : 'background.paper',
        '&:hover': readOnly
          ? undefined
          : { boxShadow: '0 6px 18px rgba(21,101,192,0.12)', transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography fontWeight={700}>{name}</Typography>
            {description && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                {description}
              </Typography>
            )}
          </Box>
          <StarRating
            value={value || 0}
            onChange={onChange}
            readOnly={readOnly}
            precision={0.5}
          />
          {(onCommentChange || comment) && (
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={2}
              label="Comments (optional)"
              placeholder="Add feedback for this competency…"
              value={comment || ''}
              onChange={(e) => onCommentChange?.(e.target.value)}
              disabled={readOnly}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Live average summary bar */
export function RatingSummaryBar({ average, count, total }) {
  const avg = Number(average) || 0;
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #1565C0 0%, #0277BD 100%)',
        color: '#fff',
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.85 }}>
              Overall Performance Score
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5}>
              <Typography variant="h3" fontWeight={800} lineHeight={1}>
                {avg > 0 ? avg.toFixed(1) : '—'}
              </Typography>
              <Box>
                <Rating
                  value={avg}
                  precision={0.5}
                  readOnly
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': { color: '#FFD54F' },
                    '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.35)' },
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  {avg > 0 ? ratingLabel(avg) : 'Awaiting ratings'}
                  {total != null ? ` · ${count || 0}/${total} rated` : ''}
                </Typography>
              </Box>
            </Stack>
          </Box>
          {avg > 0 && (
            <Chip
              label={ratingLabel(avg)}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: 14, height: 36 }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
