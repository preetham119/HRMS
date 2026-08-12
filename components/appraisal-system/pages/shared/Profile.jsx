import { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Grid, TextField, Button, Avatar, Stack, Box, Divider,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authApi, profileApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader, LoadingSkeleton, PageTransition } from '../../components/common';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.me().then((r) => r.data.data),
  });

  useEffect(() => {
    if (data) {
      setForm({
        first_name: data.firstName || data.first_name || '',
        last_name: data.lastName || data.last_name || '',
        phone: data.phone || '',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => profileApi.update(payload),
    onSuccess: () => {
      toast.success('Profile updated');
      updateUser({ firstName: form.first_name, lastName: form.last_name });
      qc.invalidateQueries(['profile']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data: res } = await profileApi.uploadPhoto(fd);
      updateUser({ profilePhoto: res.data.profilePhoto });
      toast.success('Photo updated');
      qc.invalidateQueries(['profile']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <PageTransition>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information"
        breadcrumbs={[{ label: user?.role, to: `/${user?.role}/dashboard` }, { label: 'My Profile' }]}
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  src={user?.profilePhoto || data?.profile_photo || data?.profilePhoto}
                  sx={{ width: 112, height: 112, bgcolor: 'primary.main', fontSize: 40 }}
                >
                  {(form.first_name || 'U')[0]}
                </Avatar>
                <Button component="label" startIcon={<PhotoCameraIcon />} variant="outlined" size="small">
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handlePhoto} />
                </Button>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>{form.first_name} {form.last_name}</Typography>
                  <Typography variant="body2" color="text.secondary" textTransform="capitalize">{user?.role}</Typography>
                  <Typography variant="caption" color="text.secondary">{data?.email}</Typography>
                </Box>
                {(data?.employee_code || data?.designation) && (
                  <Stack spacing={0.5} width="100%">
                    <Divider />
                    {data.employee_code && <Typography variant="body2">Code: {data.employee_code}</Typography>}
                    {data.designation && <Typography variant="body2">Designation: {data.designation}</Typography>}
                    {data.department_name && <Typography variant="body2">Department: {data.department_name}</Typography>}
                    {data.manager_name && <Typography variant="body2">Manager: {data.manager_name}</Typography>}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Personal Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="First Name" fullWidth value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Last Name" fullWidth value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" fullWidth value={data?.email || ''} disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Grid>
              </Grid>
              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                  Save Changes
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
