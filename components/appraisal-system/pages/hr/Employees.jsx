import { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  MenuItem, Stack, Chip, FormControlLabel, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { employeeApi, departmentApi, managerApi } from '../../services';
import { PageHeader, DataTable, SearchField, ConfirmDialog, PageTransition } from '../../components/common';

const emptyForm = {
  email: '', password: 'Password@123', first_name: '', last_name: '',
  employee_code: '', designation: '', phone: '', hire_date: '', department_id: '', manager_id: '',
};

export default function Employees() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [deptFilter, setDeptFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deactivateId, setDeactivateId] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, page, limit, deptFilter],
    queryFn: () => employeeApi.list({
      search, page: page + 1, limit, department_id: deptFilter || undefined,
    }).then((r) => r.data),
  });

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.list().then((r) => r.data.data),
  });

  const { data: managers } = useQuery({
    queryKey: ['managers-list'],
    queryFn: () => managerApi.list({ limit: 100 }).then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? employeeApi.update(editId, payload) : employeeApi.create(payload)),
    onSuccess: () => {
      toast.success(editId ? 'Employee updated' : 'Employee created');
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
      qc.invalidateQueries(['employees']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => employeeApi.deactivate(id),
    onSuccess: () => {
      toast.success('Employee deactivated');
      setDeactivateId(null);
      qc.invalidateQueries(['employees']);
    },
  });

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      first_name: row.first_name,
      last_name: row.last_name,
      designation: row.designation,
      phone: row.phone || '',
      hire_date: row.hire_date || '',
      department_id: row.department_id || '',
      manager_id: row.manager_id || '',
      is_active: row.is_active,
    });
    setOpen(true);
  };

  return (
    <PageTransition>
      <PageHeader
        title="Employees"
        subtitle="Manage employee records, departments, and managers"
        breadcrumbs={[{ label: 'HR', to: '/hr/dashboard' }, { label: 'Employees' }]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <SearchField value={search} onChange={(v) => { setSearch(v); setPage(0); }} />
            <TextField select size="small" label="Department" value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
              <MenuItem value="">All</MenuItem>
              {(depts || []).map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm(emptyForm); setOpen(true); }}>
              Add Employee
            </Button>
          </Stack>
        }
      />

      <DataTable
        loading={isLoading}
        rows={data?.data || []}
        page={page}
        rowsPerPage={limit}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        onRowsPerPageChange={(v) => { setLimit(v); setPage(0); }}
        columns={[
          { id: 'employee_code', label: 'Code' },
          { id: 'name', label: 'Name', render: (r) => `${r.first_name} ${r.last_name}` },
          { id: 'email', label: 'Email' },
          { id: 'designation', label: 'Designation' },
          { id: 'department_name', label: 'Department' },
          { id: 'manager_name', label: 'Manager', render: (r) => r.manager_name || '—' },
          {
            id: 'is_active',
            label: 'Status',
            render: (r) => <Chip size="small" label={r.is_active ? 'Active' : 'Inactive'} color={r.is_active ? 'success' : 'default'} />,
          },
          {
            id: 'actions',
            label: 'Actions',
            render: (r) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
                {!!r.is_active && (
                  <Button size="small" color="error" onClick={() => setDeactivateId(r.id)}>Deactivate</Button>
                )}
              </Stack>
            ),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            {!editId && (
              <>
                <Grid item xs={12}><TextField label="Email" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label="Password" fullWidth value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label="Employee Code" fullWidth value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} /></Grid>
              </>
            )}
            <Grid item xs={6}><TextField label="First Name" fullWidth value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Last Name" fullWidth value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Designation" fullWidth value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Hire Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} /></Grid>
            <Grid item xs={6}>
              <TextField select label="Department" fullWidth value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                {(depts || []).map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Manager" fullWidth value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })}>
                <MenuItem value="">None</MenuItem>
                {(managers || []).map((m) => <MenuItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</MenuItem>)}
              </TextField>
            </Grid>
            {editId && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />}
                  label="Active"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deactivateId}
        title="Deactivate Employee?"
        message="The employee will no longer be able to log in."
        confirmText="Deactivate"
        color="error"
        onCancel={() => setDeactivateId(null)}
        onConfirm={() => deactivateMutation.mutate(deactivateId)}
        loading={deactivateMutation.isPending}
      />
    </PageTransition>
  );
}
