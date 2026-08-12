import DashboardIcon from '@mui/icons-material/Dashboard';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import FeedbackIcon from '@mui/icons-material/Feedback';
import GroupsIcon from '@mui/icons-material/Groups';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BarChartIcon from '@mui/icons-material/BarChart';
import LoopIcon from '@mui/icons-material/Loop';
import ApprovalIcon from '@mui/icons-material/Approval';
import SettingsIcon from '@mui/icons-material/Settings';

export const employeeMenu = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: <DashboardIcon /> },
  { label: 'My Goals', path: '/employee/goals', icon: <FlagIcon /> },
  { label: 'Self Appraisal', path: '/employee/self-appraisal', icon: <AssignmentIcon /> },
  { label: 'Appraisal History', path: '/employee/appraisal-history', icon: <HistoryIcon /> },
  { label: 'Feedback', path: '/employee/feedback', icon: <FeedbackIcon /> },
];

export const managerMenu = [
  { label: 'Dashboard', path: '/manager/dashboard', icon: <DashboardIcon /> },
  { label: 'Team Members', path: '/manager/team', icon: <GroupsIcon /> },
  { label: 'Pending Reviews', path: '/manager/pending-reviews', icon: <RateReviewIcon /> },
  { label: 'Completed Reviews', path: '/manager/completed-reviews', icon: <DoneAllIcon /> },
  { label: 'Reports', path: '/manager/reports', icon: <BarChartIcon /> },
];

export const hrMenu = [
  { label: 'Dashboard', path: '/hr/dashboard', icon: <DashboardIcon /> },
  { label: 'Appraisal Cycles', path: '/hr/cycles', icon: <LoopIcon /> },
  { label: 'Reports', path: '/hr/reports', icon: <BarChartIcon /> },
  { label: 'Settings', path: '/hr/settings', icon: <SettingsIcon /> },
];

export const leadershipMenu = [
  { label: 'Dashboard', path: '/leadership/dashboard', icon: <DashboardIcon /> },
  { label: 'Approvals', path: '/leadership/approvals', icon: <ApprovalIcon /> },
];

export const adminMenu = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Approvals', path: '/admin/approvals', icon: <ApprovalIcon /> },
];
