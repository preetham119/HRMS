import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { departmentApi } from '../../services';
import { PageHeader, DataTable, SearchField, ConfirmDialog, PageTransition } from '../../components/common';

export default function Departments() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [deleteId, setDeleteId] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['departments', search],
    queryFn: () => departmentApi.list({ search }).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? departmentApi.update(editId, payload) : departmentApi.create(payload)),
    onSuccess: () => {
      toast.success(editId ? 'Department updated' : 'Department created');
      setOpen(false);
      qc.invalidateQueries(['departments']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => departmentApi.remove(id),
    onSuccess: () => {
      toast.success('Department deleted');
      setDeleteId(null);
      qc.invalidateQueries(['departments']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <PageTransition>
      <PageHeader
        title="Departments"
        subtitle="Create and manage organizational departments"
        breadcrumbs={[{ label: 'HR', to: '/hr/dashboard' }, { label: 'Departments' }]}
        action={
          <Stack direction="row" spacing={1}>
            <SearchField value={search} onChange={setSearch} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm({ name: '', description: '' }); setOpen(true); }}>
              Add Department
            </Button>
          </Stack>
        }
      />

      <DataTable
        loading={isLoading}
        rows={data?.data || []}
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'description', label: 'Description', render: (r) => r.description || '—' },
          { id: 'employee_count', label: 'Employees' },
          { id: 'manager_count', label: 'Managers' },
          {
            id: 'actions',
            label: 'Actions',
            render: (r) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => { setEditId(r.id); setForm({ name: r.name, description: r.description || '' }); setOpen(true); }}>Edit</Button>
                <Button size="small" color="error" onClick={() => setDeleteId(r.id)}>Delete</Button>
              </Stack>
            ),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Department?"
        message="This action cannot be undone if no employees are assigned."
        confirmText="Delete"
        color="error"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </PageTransition>
  );
}
