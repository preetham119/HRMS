import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import EmbeddedLayout from '../layouts/EmbeddedLayout';
import { employeeMenu, managerMenu, hrMenu, leadershipMenu, adminMenu } from './menuConfig';
import { useAuth, DASHBOARD_PATHS } from '../contexts/AuthContext';

import EmployeeDashboard from '../pages/employee/Dashboard';
import MyGoals from '../pages/employee/MyGoals';
import SelfAppraisal from '../pages/employee/SelfAppraisal';
import AppraisalHistory from '../pages/employee/AppraisalHistory';
import Feedback from '../pages/employee/Feedback';

import ManagerDashboard from '../pages/manager/Dashboard';
import TeamMembers from '../pages/manager/TeamMembers';
import PendingReviews from '../pages/manager/PendingReviews';
import CompletedReviews from '../pages/manager/CompletedReviews';
import ReviewAppraisal from '../pages/manager/ReviewAppraisal';
import ManagerReports from '../pages/manager/Reports';

import HRDashboard from '../pages/hr/Dashboard';
import AppraisalCycles from '../pages/hr/AppraisalCycles';
import HRReports from '../pages/hr/Reports';
import Settings from '../pages/hr/Settings';

import LeadershipDashboard from '../pages/leadership/Dashboard';
import LeadershipApprovals from '../pages/leadership/Approvals';
import LeadershipReviewAppraisal from '../pages/leadership/ReviewAppraisal';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminApprovals from '../pages/admin/Approvals';
import AdminReviewAppraisal from '../pages/admin/ReviewAppraisal';

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading || !user) {
    return (
      <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Loading performance…
      </div>
    );
  }
  return <Navigate to={DASHBOARD_PATHS[user.role] || '/employee/dashboard'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute roles={['employee']} />}>
        <Route path="/employee" element={<EmbeddedLayout menuItems={employeeMenu} title="Performance" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="goals" element={<MyGoals />} />
          <Route path="self-appraisal" element={<SelfAppraisal />} />
          <Route path="appraisal-history" element={<AppraisalHistory />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['manager']} />}>
        <Route path="/manager" element={<EmbeddedLayout menuItems={managerMenu} title="Performance" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="goals" element={<MyGoals />} />
          <Route path="self-appraisal" element={<SelfAppraisal />} />
          <Route path="appraisal-history" element={<AppraisalHistory />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="team" element={<TeamMembers />} />
          <Route path="pending-reviews" element={<PendingReviews />} />
          <Route path="completed-reviews" element={<CompletedReviews />} />
          <Route path="review/:id" element={<ReviewAppraisal />} />
          <Route path="reports" element={<ManagerReports />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['hr']} />}>
        <Route path="/hr" element={<EmbeddedLayout menuItems={hrMenu} title="Performance" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HRDashboard />} />
          <Route path="cycles" element={<AppraisalCycles />} />
          <Route path="reports" element={<HRReports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['leadership']} />}>
        <Route path="/leadership" element={<EmbeddedLayout menuItems={leadershipMenu} title="Performance" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LeadershipDashboard />} />
          <Route path="approvals" element={<LeadershipApprovals />} />
          <Route path="review/:id" element={<LeadershipReviewAppraisal />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<EmbeddedLayout menuItems={adminMenu} title="Performance" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="review/:id" element={<AdminReviewAppraisal />} />
        </Route>
      </Route>

      <Route path="/" element={<RoleHome />} />
      <Route path="*" element={<RoleHome />} />
    </Routes>
  );
}
