import { useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Button, TextField, MenuItem, Chip,
  LinearProgress, Grid, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, Paper, Avatar,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { reportApi } from '../../services';
import {
  PageHeader, LoadingSkeleton, PageTransition, SearchField, StatusChip, StatCard,
  EmptyState, AppraisalDetailDialog,
} from '../../components/common';
import { downloadBlob, STATUS_LABELS } from '../../utils/helpers';

function StageIcon({ done, label }) {
  return (
    <Tooltip title={label}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', color: done ? 'success.main' : 'text.disabled' }}>
        {done ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
      </Box>
    </Tooltip>
  );
}

function progressColor(p) {
  if (p >= 100) return 'success';
  if (p >= 50) return 'primary';
  if (p > 0) return 'warning';
  return 'inherit';
}

const tablePaperSx = {
  overflow: 'hidden',
  borderRadius: '20px',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  boxShadow: '0 2px 10px rgba(21,101,192,0.04)',
};

const filterCardSx = {
  mb: 3,
  borderRadius: '20px',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 2px 10px rgba(21,101,192,0.04)',
};

export default function HRReports() {
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [status, setStatus] = useState('');
  const [completion, setCompletion] = useState('');
  const [sortBy, setSortBy] = useState('employee_name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedId, setSelectedId] = useState(null);

  const filters = useMemo(() => ({
    search: search || undefined,
    department_id: departmentId || undefined,
    manager_id: managerId || undefined,
    cycle_id: cycleId || undefined,
    status: status || undefined,
    completion: completion || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
  }), [search, departmentId, managerId, cycleId, status, completion, sortBy, sortDir]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['hr-appraisal-progress', filters],
    queryFn: () => reportApi.appraisalProgress(filters).then((r) => r.data),
  });

  const { data: detail, isLoading: detailLoading, isError: detailError } = useQuery({
    queryKey: ['hr-appraisal-detail', selectedId],
    queryFn: () => reportApi.appraisalProgressDetail(selectedId).then((r) => r.data.data),
    enabled: !!selectedId,
    retry: 1,
  });

  const rows = useMemo(() => {
    const list = [...(data?.data || [])];
    list.sort((a, b) => {
      const av = a?.[sortBy] ?? '';
      const bv = b?.[sortBy] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [data?.data, sortBy, sortDir]);

  const filterOpts = data?.filters || { departments: [], managers: [], cycles: [] };
  const summary = data?.summary || {};

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const openDetails = (appraisalId) => {
    if (!appraisalId) {
      toast.info('No appraisal started for this employee yet');
      return;
    }
    setSelectedId(appraisalId);
  };

  const handleExportAll = async (format) => {
    try {
      const res = format === 'excel'
        ? await reportApi.exportProgressExcel(filters)
        : await reportApi.exportProgressPdf(filters);
      downloadBlob(res.data, `appraisal_progress.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      toast.success(`Bulk ${format.toUpperCase()} downloaded`);
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportOne = async (appraisalId, code) => {
    if (!appraisalId) {
      toast.info('No appraisal started for this employee yet');
      return;
    }
    try {
      const res = await reportApi.exportAppraisalPdf(appraisalId);
      downloadBlob(res.data, `appraisal_${code || appraisalId}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF export failed');
    }
  };

  if (isLoading) return <LoadingSkeleton rows={8} />;

  return (
    <PageTransition>
      <PageHeader
        title="Reports"
        subtitle="Track every employee appraisal workflow, review details, and export reports"
        breadcrumbs={[{ label: 'HR', to: '/hr/dashboard' }, { label: 'Reports' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<FileDownloadIcon />} variant="outlined" onClick={() => handleExportAll('excel')}>
              Export Excel
            </Button>
            <Button startIcon={<PictureAsPdfIcon />} variant="outlined" onClick={() => handleExportAll('pdf')}>
              Export PDF
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Employees" value={summary.total || 0} icon={<GroupsIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Progress" value={`${summary.avg_progress || 0}%`} icon={<TrendingUpIcon />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="In Progress" value={summary.in_progress || 0} icon={<HourglassEmptyIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed" value={summary.completed || 0} icon={<DoneAllIcon />} color="success" />
        </Grid>
      </Grid>

      <Card sx={filterCardSx}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <SearchField value={search} onChange={setSearch} placeholder="Search employee / ID..." sx={{ minWidth: 220 }} />
            <TextField select size="small" label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">All</MenuItem>
              {(filterOpts.departments || []).map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Manager" value={managerId} onChange={(e) => setManagerId(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">All</MenuItem>
              {(filterOpts.managers || []).map((m) => (
                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Cycle" value={cycleId} onChange={(e) => setCycleId(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="">Open cycle</MenuItem>
              {(filterOpts.cycles || []).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="">All statuses</MenuItem>
              {['draft', 'under_manager_review', 'under_admin_review', 'under_leadership_review', 'completed', 'returned'].map((s) => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s] || s}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Completion" value={completion} onChange={(e) => setCompletion(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="not_started">Not started</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <Button variant="text" onClick={() => { setSearch(''); setDepartmentId(''); setManagerId(''); setCycleId(''); setStatus(''); setCompletion(''); refetch(); }}>
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {!rows.length ? (
        <EmptyState
          title="No appraisals found"
          description="No employees match the selected filters."
        />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={tablePaperSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  { id: 'employee_code', label: 'Employee ID' },
                  { id: 'employee_name', label: 'Employee Name' },
                  { id: 'manager_name', label: 'Reporting Manager' },
                  { id: 'cycle_name', label: 'Cycle' },
                  { id: 'progress', label: 'Progress' },
                  { id: 'self_done', label: 'Self Appraisal' },
                  { id: 'manager_done', label: 'Manager Review' },
                  { id: 'admin_done', label: 'Admin Review' },
                  { id: 'leadership_done', label: 'CEO Review' },
                  { id: 'overallRating', label: 'Rating' },
                  { id: 'status', label: 'Status' },
                ].map((col) => (
                  <TableCell key={col.id} sortDirection={sortBy === col.id ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortDir : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: row.appraisal_id ? 'pointer' : 'default' }}
                  onClick={() => openDetails(row.appraisal_id)}
                >
                  <TableCell>{row.employee_code}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={row.profile_photo || undefined} sx={{ width: 28, height: 28, fontSize: 12 }}>
                        {row.employee_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{row.employee_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.designation}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.manager_name}</TableCell>
                  <TableCell>{row.cycle_name}</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">Workflow</Typography>
                        <Typography variant="caption" fontWeight={800} color={`${progressColor(row.progress)}.main`}>
                          {row.progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={row.progress}
                        color={progressColor(row.progress) === 'inherit' ? 'primary' : progressColor(row.progress)}
                        sx={{ height: 10, borderRadius: 999 }}
                      />
                      <Stack direction="row" spacing={0.5}>
                        <StageIcon done={row.self_done} label="Self Evaluation Completed" />
                        <StageIcon done={row.manager_done} label="Manager Review Completed" />
                        <StageIcon done={row.admin_done} label="Admin Review Completed" />
                        <StageIcon done={row.leadership_done} label="Leadership Review Completed" />
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.self_done ? 'Completed' : 'Pending'} color={row.self_done ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.manager_done ? 'Completed' : 'Pending'} color={row.manager_done ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.admin_done ? 'Completed' : 'Pending'} color={row.admin_done ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.leadership_done ? 'Completed' : 'Pending'} color={row.leadership_done ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>{row.overallRating != null ? Number(row.overallRating).toFixed(1) : '—'}</TableCell>
                  <TableCell><StatusChip status={row.status} /></TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View details">
                      <span>
                        <IconButton size="small" disabled={!row.appraisal_id} onClick={() => openDetails(row.appraisal_id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <span>
                        <IconButton size="small" disabled={!row.appraisal_id} onClick={() => handleExportOne(row.appraisal_id, row.employee_code)}>
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AppraisalDetailDialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        detail={detailError ? null : detail}
        loading={detailLoading}
        onDownloadPdf={() => handleExportOne(selectedId, detail?.appraisal?.employee_code)}
      />
    </PageTransition>
  );
}
