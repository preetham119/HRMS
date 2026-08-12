import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { appraisalApi } from '../../services';
import { PageHeader, DataTable, StatusChip, PageTransition } from '../../components/common';
import { formatDate } from '../../utils/helpers';

export default function PendingReviews() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: () => appraisalApi.pendingReviews().then((r) => r.data.data),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  return (
    <PageTransition>
      <PageHeader
        title="Pending Reviews"
        subtitle="Employee self-appraisals awaiting your review"
        breadcrumbs={[{ label: 'Manager', to: '/manager/dashboard' }, { label: 'Pending Reviews' }]}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        emptyTitle="No pending reviews"
        emptyDescription="You're all caught up."
        onRowClick={(r) => navigate(`/manager/review/${r.id}`)}
        columns={[
          { id: 'employee_name', label: 'Employee' },
          { id: 'employee_code', label: 'Code' },
          { id: 'designation', label: 'Role' },
          { id: 'department', label: 'Department' },
          { id: 'cycle_name', label: 'Cycle' },
          {
            id: 'self_rating',
            label: 'Self Rating',
            render: (r) => (r.self_rating != null ? `${Number(r.self_rating).toFixed(1)}★` : '—'),
          },
          { id: 'submitted_at', label: 'Submitted', render: (r) => formatDate(r.submitted_at) },
          { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
          {
            id: 'action',
            label: 'Details',
            stopPropagation: true,
            render: (r) => (
              <Button size="small" variant="contained" onClick={() => navigate(`/manager/review/${r.id}`)}>
                View & Rate
              </Button>
            ),
          },
        ]}
      />
    </PageTransition>
  );
}
