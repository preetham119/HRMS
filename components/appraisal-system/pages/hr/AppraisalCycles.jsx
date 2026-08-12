import { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { appraisalApi } from '../../services';
import { PageHeader, DataTable, StatusChip, PageTransition } from '../../components/common';
import { formatDate } from '../../utils/helpers';

export default function AppraisalCycles() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => appraisalApi.cycles({ limit: 50 }).then((r) => r.data),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const refreshAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['cycles'] }),
      qc.invalidateQueries({ queryKey: ['hr-dashboard'] }),
      qc.invalidateQueries({ queryKey: ['hr-appraisal-progress'] }),
      qc.invalidateQueries({ queryKey: ['notifications'] }),
      qc.invalidateQueries({ queryKey: ['employee-dashboard'] }),
      qc.invalidateQueries({ queryKey: ['my-appraisal'] }),
      refetch(),
    ]);
  };

  const createAndOpenMutation = useMutation({
    mutationFn: async (payload) => {
      const created = await appraisalApi.createCycle(payload);
      const id = created.data.data.id;
      const opened = await appraisalApi.updateCycle(id, { status: 'open' });
      return opened;
    },
    onSuccess: async (res) => {
      toast.success(res?.data?.message || 'Cycle created and opened — employees can start Self Appraisal');
      setOpen(false);
      setForm({ name: '', description: '', start_date: '', end_date: '' });
      await refreshAll();
    },
    onError: (e) => toast.error(e.response?.data?.message || e.message || 'Failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => appraisalApi.updateCycle(id, { status }),
    onSuccess: async (res, variables) => {
      toast.success(res?.data?.message || 'Cycle updated');
      await refreshAll();
      if (variables?.status === 'open') {
        toast.info('Employees can now open Self Appraisal');
      }
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const rows = data?.data || [];
  const hasOpen = rows.some((r) => r.status === 'open');

  return (
    <PageTransition>
      <PageHeader
        title="Appraisal Cycles"
        subtitle="Create and open a cycle so employees can complete Self Appraisal"
        breadcrumbs={[{ label: 'HR', to: '/hr/dashboard' }, { label: 'Appraisal Cycles' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Create & Open Cycle
          </Button>
        }
      />

      {!hasOpen && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No cycle is open. Employees will see a blank/waiting Self Appraisal until you open a cycle.
        </Alert>
      )}

      {hasOpen && (
        <Alert severity="success" sx={{ mb: 2 }}>
          A cycle is open. Employees can fill and submit Self Appraisal now.
        </Alert>
      )}

      <DataTable
        loading={isLoading}
        rows={rows}
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'start_date', label: 'Start', render: (r) => formatDate(r.start_date) },
          { id: 'end_date', label: 'End', render: (r) => formatDate(r.end_date) },
          { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
          { id: 'appraisal_count', label: 'Appraisals' },
          {
            id: 'actions',
            label: 'Actions',
            render: (r) => (
              <Stack direction="row" spacing={1}>
                {r.status === 'draft' && (
                  <Button size="small" variant="contained" onClick={() => statusMutation.mutate({ id: r.id, status: 'open' })}>
                    Open
                  </Button>
                )}
                {r.status === 'open' && (
                  <Button size="small" color="warning" onClick={() => statusMutation.mutate({ id: r.id, status: 'closed' })}>
                    Close
                  </Button>
                )}
                {r.status === 'closed' && (
                  <Button size="small" onClick={() => statusMutation.mutate({ id: r.id, status: 'archived' })}>
                    Archive
                  </Button>
                )}
              </Stack>
            ),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create & Open Appraisal Cycle</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
            This creates the cycle and opens it immediately so employees can start Self Appraisal.
          </Alert>
          <Stack spacing={2}>
            <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="H2 2026 Appraisal Cycle" />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createAndOpenMutation.mutate(form)}
            disabled={createAndOpenMutation.isPending || !form.name.trim() || !form.start_date || !form.end_date}
          >
            {createAndOpenMutation.isPending ? 'Opening…' : 'Create & Open'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageTransition>
  );
}
