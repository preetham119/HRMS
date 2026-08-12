import {
  Box, Card, CardContent, Grid, Stack, Typography, Avatar, Chip,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { STATUS_LABELS, formatDate } from '../../utils/helpers';

const statusChipSx = (status) => {
  if (
    status === 'under_manager_review'
    || status === 'under_hr_review'
    || status === 'under_leadership_review'
    || status === 'under_admin_review'
  ) {
    return { bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 700 };
  }
  if (status === 'completed' || status === 'open') {
    return { bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 };
  }
  if (status === 'returned') {
    return { bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 700 };
  }
  return { bgcolor: '#ECEFF1', color: '#455A64', fontWeight: 700 };
};

function calcDaysRemaining(dueDate, provided) {
  if (provided != null && Number.isFinite(Number(provided))) return Number(provided);
  if (!dueDate) return null;
  const end = new Date(dueDate);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

function MetaItem({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" minWidth={0}>
      <Box sx={{ color: 'text.secondary', mt: 0.15, flexShrink: 0 }}>{icon}</Box>
      <Box minWidth={0}>
        <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

function InfoBlock({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2} mb={0.25}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export default function DashboardProfileBanner({ profile }) {
  if (!profile) return null;
  const days = calcDaysRemaining(profile.dueDate, profile.daysRemaining);
  const dueHint =
    days == null
      ? null
      : days < 0
        ? `${Math.abs(days)} days overdue`
        : days === 0
          ? 'Due today'
          : `${days} days remaining`;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={7}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar
                src={profile.photo || undefined}
                sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28, fontWeight: 700 }}
              >
                {(profile.name || '?').charAt(0)}
              </Avatar>
              <Box flex={1} minWidth={0}>
                <Typography variant="h5" fontWeight={800} noWrap>
                  {profile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  {[profile.employeeCode, profile.designation].filter(Boolean).join(' • ') || '—'}
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={4}>
                    <MetaItem icon={<BusinessIcon fontSize="small" />} label="Department" value={profile.department} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MetaItem
                      icon={<CalendarMonthIcon fontSize="small" />}
                      label="Date of Joining"
                      value={formatDate(profile.hireDate)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MetaItem
                      icon={<PersonOutlineIcon fontSize="small" />}
                      label="Reporting Manager"
                      value={profile.managerName}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                pl: { md: 2 },
                borderLeft: { md: '1px solid' },
                borderColor: { md: 'divider' },
              }}
            >
              <Grid container spacing={1.25} columnSpacing={2}>
                <Grid item xs={12} sm={7}>
                  <MetaItem
                    icon={<DescriptionOutlinedIcon fontSize="small" />}
                    label="Review Cycle"
                    value={profile.cycleName || 'No open cycle'}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <InfoBlock label="Status">
                    <Chip
                      size="small"
                      label={STATUS_LABELS[profile.status] || profile.status}
                      sx={statusChipSx(profile.status)}
                    />
                  </InfoBlock>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <MetaItem
                    icon={<CalendarMonthIcon fontSize="small" />}
                    label="Review Period"
                    value={
                      profile.reviewPeriodStart
                        ? `${formatDate(profile.reviewPeriodStart)} - ${formatDate(profile.reviewPeriodEnd)}`
                        : '—'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <InfoBlock label="Due Date">
                    <Typography variant="body2" fontWeight={800}>
                      {formatDate(profile.dueDate) || '—'}
                    </Typography>
                    {dueHint && (
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        display="block"
                        sx={{ color: days != null && days <= 7 ? 'error.main' : 'success.main' }}
                      >
                        {dueHint}
                      </Typography>
                    )}
                  </InfoBlock>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
