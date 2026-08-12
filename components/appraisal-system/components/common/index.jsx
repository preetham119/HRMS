import {
  Box, Card, CardContent, Typography, Skeleton, Stack, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  TableSortLabel, TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, CircularProgress, Paper, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers';

export function PageHeader({ title, subtitle, action, breadcrumbs }) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs?.length > 0 && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
          {breadcrumbs.map((b, i) =>
            b.to ? (
              <MuiLink key={i} component={RouterLink} to={b.to} underline="hover" color="inherit" variant="body2">
                {b.label}
              </MuiLink>
            ) : (
              <Typography key={i} variant="body2" color="text.primary">{b.label}</Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>}
        </Box>
        {action}
      </Stack>
    </Box>
  );
}

export function StatCard({ title, value, icon, color = 'primary', subtitle, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 10px rgba(21,101,192,0.04)',
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            p: compact ? 1.75 : 2,
            '&:last-child': { pb: compact ? 1.75 : 2 },
          }}
        >
          {compact ? (
            <Stack spacing={1} sx={{ height: '100%', justifyContent: 'space-between' }}>
              <Avatar
                sx={{
                  bgcolor: `${color}.main`,
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                }}
              >
                {icon}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {title}
                </Typography>
                <Typography variant="h4" fontWeight={700} color={`${color}.main`} sx={{ lineHeight: 1.15, mt: 0.75 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : (
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap title={title}>
                  {title}
                </Typography>
                <Typography variant="h4" fontWeight={700} mt={0.5} color={`${color}.main`}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48, flexShrink: 0 }}>{icon}</Avatar>
            </Stack>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatusChip({ status }) {
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

export function EmptyState({ title = 'No data found', description = 'There is nothing to display yet.', action }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: '20px',
        borderColor: 'divider',
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>{description}</Typography>
      {action}
    </Paper>
  );
}

export function LoadingSkeleton({ rows = 5 }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} />
      ))}
    </Stack>
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading, confirmText = 'Confirm', color = 'primary' }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="contained" color={color} onClick={onConfirm} disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function SearchField({ value, onChange, placeholder = 'Search...', sx }) {
  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{ minWidth: 220, ...sx }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}

export function DataTable({
  columns, rows, loading, page, rowsPerPage, total, onPageChange, onRowsPerPageChange,
  sortBy, sortOrder, onSort, emptyTitle, emptyDescription, onRowClick,
}) {
  if (loading) return <LoadingSkeleton />;
  if (!rows?.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderRadius: '20px',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 10px rgba(21,101,192,0.04)',
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'} sx={{ whiteSpace: 'nowrap' }}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortOrder : 'asc'}
                      onClick={() => onSort?.(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow
                key={row.id || idx}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    onClick={col.stopPropagation ? (e) => e.stopPropagation() : undefined}
                  >
                    {col.render ? col.render(row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {total != null && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Paper>
  );
}

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export { default as WorkflowProgressBar } from './WorkflowProgressBar';
export { default as DashboardProfileBanner } from './DashboardProfileBanner';
export { default as AppraisalDetailDialog } from './AppraisalDetailDialog';
