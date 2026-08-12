import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { appraisalApi } from '../../services';
import { PageHeader, DataTable, StatusChip, PageTransition } from '../../components/common';
import { formatDate } from '../../utils/helpers';

export default function CompletedReviews() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['completed-reviews'],
    queryFn: () => appraisalApi.completedReviews().then((r) => r.data.data),
  });

  return (
    <PageTransition>
      <PageHeader
        title="Completed Reviews"
        subtitle="Reviews you have submitted to Admin"
        breadcrumbs={[{ label: 'Manager', to: '/manager/dashboard' }, { label: 'Completed Reviews' }]}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        emptyTitle="No completed reviews yet"
        emptyDescription="Submitted team reviews will appear here."
        columns={[
          { id: 'employee_name', label: 'Employee' },
          { id: 'employee_code', label: 'Code' },
          { id: 'cycle_name', label: 'Cycle' },
          { id: 'overall_rating', label: 'Your Rating' },
          { id: 'final_rating', label: 'Final Rating', render: (r) => r.final_rating || '—' },
          { id: 'reviewed_at', label: 'Reviewed', render: (r) => formatDate(r.reviewed_at) },
          { id: 'status', label: 'Status', render: (r) => <StatusChip status={r.status} /> },
          {
            id: 'action',
            label: 'Details',
            stopPropagation: true,
            render: (r) => (
              <Button size="small" variant="outlined" onClick={() => navigate(`/manager/review/${r.id}`)}>View details</Button>
            ),
          },
        ]}
        onRowClick={(r) => navigate(`/manager/review/${r.id}`)}
      />
    </PageTransition>
  );
}
