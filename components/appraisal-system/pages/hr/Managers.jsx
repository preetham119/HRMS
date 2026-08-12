import { useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Stack, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { managerApi, departmentApi, employeeApi } from '../../services';
import { PageHeader, DataTable, SearchField, PageTransition } from '../../components/common';

const empty = {
  email: '', password: 'Password@123', first_name: '', last_name: '',
  employee_code: '', designation: '', phone: '', hire_date: '', department_id: '',
};

export default function Managers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [assignOpen, setAssignOpen] = useState(null);
  const [selectedEmps, setSelectedEmps] = useState([]);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['managers', search, page],
    queryFn: () => managerApi.list({ search, page: page + 1, limit: 10 }).then((r) => r.data),
  });

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.list().then((r) => r.data.data),
  });

  const { data: allEmps } = useQuery({
    queryKey: ['all-emps-assign'],
    queryFn: () => employeeApi.list({ limit: 100 }).then((r) => r.data.data),
    enabled: !!assignOpen,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? managerApi.update(editId, payload) : managerApi.create(payload)),
    onSuccess: () => {
      toast.success(editId ? 'Manager updated' : 'Manager created');
      setOpen(false);
      qc.invalidateQueries(['managers']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, employee_ids }) => managerApi.update(id, { employee_ids }),
    onSuccess: () => {
      toast.success('Team assignments updated');
      setAssignOpen(null);
      qc.invalidateQueries(['managers']);
    },
  });

  return (
    <PageTransition>
      <PageHeader
        title="Managers"
        subtitle="Manage managers and team assignments"
        breadcrumbs={[{ label: 'HR', to: '/hr/dashboard' }, { label: 'Managers' }]}
        action={
          <Stack direction="row" spacing={1}>
            <SearchField value={search} onChange={(v) => { setSearch(v); setPage(0); }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setForm(empty); setOpen(true); }}>
              Add Manager
            </Button>
          </Stack>
        }
      />

      <DataTable
        loading={isLoading}
        rows={data?.data || []}
        page={page}
        rowsPerPage={10}
        total={data?.pagination?.total || 0}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        columns={[
          { id: 'employee_code', label: 'Code' },
          { id: 'name', label: 'Name', render: (r) => `${r.first_name} ${r.last_name}` },
          { id: 'email', label: 'Email' },
          { id: 'designation', label: 'Designation' },
          { id: 'department_name', label: 'Department' },
          { id: 'team_count', label: 'Team Size' },
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
                <Button size="small" onClick={() => {
                  setEditId(r.id);
                  setForm({
                    first_name: r.first_name, last_name: r.last_name, designation: r.designation,
                    phone: r.phone || '', hire_date: r.hire_date || '', department_id: r.department_id || '',
                  });
                  setOpen(true);
                }}>Edit</Button>
                <Button size="small" variant="outlined" onClick={async () => {
                  const { data: detail } = await managerApi.get(r.id);
                  setAssignOpen(r);
                  setSelectedEmps((detail.data.team || []).map((t) => t.id));
                }}>Assign</Button>
              </Stack>
            ),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Manager' : 'Add Manager'}</DialogTitle>
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
            <Grid item xs={12}>
              <TextField select label="Department" fullWidth value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                {(depts || []).map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!assignOpen} onClose={() => setAssignOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Employees — {assignOpen?.first_name}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Team Members"
            fullWidth
            SelectProps={{ multiple: true }}
            value={selectedEmps}
            onChange={(e) => setSelectedEmps(e.target.value)}
            sx={{ mt: 1 }}
          >
            {(allEmps || []).map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_code})</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => assignMutation.mutate({ id: assignOpen.id, employee_ids: selectedEmps })}>
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>
    </PageTransition>
  );
}
