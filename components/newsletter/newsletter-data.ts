export type NewsletterEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  birthday: string;
  anniversary: string;
  anniversaryYears: number;
  photo: string;
};

export type NewsletterIssue = {
  id: string;
  title: string;
  category: string;
  publishedDate: string;
  author: string;
  authorImage: string;
  description: string;
  attachment?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  };
};

/** Existing celebration roster — keep fields and values intact. */
export const employees: NewsletterEmployee[] = [
  {
    id: 'EMP00145',
    name: 'Sarah Chen',
    role: 'Software Engineer',
    department: 'Engineering',
    birthday: 'May 14',
    anniversary: 'January 12',
    anniversaryYears: 3,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=60',
  },
  {
    id: 'EMP00188',
    name: 'Alex Rodriguez',
    role: 'Product Manager',
    department: 'Product',
    birthday: 'May 16',
    anniversary: 'March 20',
    anniversaryYears: 2,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=60',
  },
  {
    id: 'EMP00210',
    name: 'Emily Davis',
    role: 'UX Designer',
    department: 'Design',
    birthday: 'May 18',
    anniversary: 'June 02',
    anniversaryYears: 5,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=60',
  },
];

/** Existing newsletter issues — preserve titles, actions rely on these ids. */
export const newsletters: NewsletterIssue[] = [
  {
    id: 'NL202405',
    title: 'Company Monthly Newsletter - May 2024',
    category: 'Company News',
    publishedDate: 'May 18, 2024',
    author: 'Sarah Chen',
    authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=60',
    description: 'A complete update on people initiatives, culture stories, and HR announcements.',
  },
  {
    id: 'NL202404',
    title: 'Project Updates & Q1 Recap',
    category: 'Company News',
    publishedDate: 'May 15, 2024',
    author: 'David Kim',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=60',
    description: 'Key accomplishments and plans from the last quarter across teams.',
  },
];

export const newJoiners = [
  {
    id: 'EMP00301',
    name: 'Priya Nair',
    role: 'People Operations Associate',
    department: 'Human Resources',
    joinedOn: 'Jul 22, 2026',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=60',
  },
  {
    id: 'EMP00312',
    name: 'Rohan Mehta',
    role: 'Backend Engineer',
    department: 'Engineering',
    joinedOn: 'Jul 28, 2026',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=60',
  },
];

export const spotlights = [
  {
    id: 'SP-01',
    name: 'Emily Davis',
    role: 'UX Designer',
    quote: 'Led the accessibility refresh that improved form completion by 18%.',
    badge: 'Culture Champion',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=60',
  },
  {
    id: 'SP-02',
    name: 'Alex Rodriguez',
    role: 'Product Manager',
    quote: 'Shipped the manager approval inbox used by every people process.',
    badge: 'Impact Award',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=60',
  },
];

export const upcomingEvents = [
  {
    id: 'EV-01',
    title: 'Town Hall — Q3 Priorities',
    date: 'Aug 8, 2026',
    time: '4:00 PM IST',
    location: 'All-hands · Hybrid',
  },
  {
    id: 'EV-02',
    title: 'Benefits Enrollment Clinic',
    date: 'Aug 14, 2026',
    time: '11:30 AM IST',
    location: 'HR Lounge / Zoom',
  },
  {
    id: 'EV-03',
    title: 'Hack Day Kickoff',
    date: 'Aug 21, 2026',
    time: '10:00 AM IST',
    location: 'Innovation Hub',
  },
];

export const announcements = [
  {
    id: 'AN-01',
    title: 'Office closed — Independence Day',
    body: 'All offices will remain closed on August 15. Support coverage stays available via IT Service Desk.',
    tone: 'info' as const,
    date: 'Jul 30',
  },
  {
    id: 'AN-02',
    title: 'Submit tax declarations by Aug 20',
    body: 'Update investment proofs in Payroll → Tax Declaration to avoid default tax regime.',
    tone: 'warning' as const,
    date: 'Jul 29',
  },
];

export const policyUpdates = [
  {
    id: 'PO-01',
    title: 'Hybrid work guidelines updated',
    category: 'Workplace',
    effective: 'Aug 1, 2026',
  },
  {
    id: 'PO-02',
    title: 'Leave policy — sandwich rule clarification',
    category: 'Leave',
    effective: 'Aug 5, 2026',
  },
  {
    id: 'PO-03',
    title: 'Travel & expense reimbursement SLAs',
    category: 'Finance',
    effective: 'Aug 10, 2026',
  },
];

export const learningHighlights = [
  {
    id: 'LN-01',
    title: 'Manager Essentials: Coaching 101',
    meta: 'Live cohort · 90 min',
    seats: '12 seats left',
  },
  {
    id: 'LN-02',
    title: 'Data Privacy Awareness (Mandatory)',
    meta: 'Self-paced · Due Aug 31',
    seats: 'Compliance',
  },
  {
    id: 'LN-03',
    title: 'Excel for People Analytics',
    meta: 'Workshop · Aug 18',
    seats: 'Open',
  },
];

export const quickLinks = [
  { label: 'Apply Leave', href: '/leave' },
  { label: 'View Payslips', href: '/payroll/salary-slips' },
  { label: 'Upload Documents', href: '/documents' },
  { label: 'IT Service Desk', href: '/help-desk' },
  { label: 'My Profile', href: '/profile' },
  { label: 'Learning Hub', href: '/learning' },
];

export const recognitions = [
  {
    id: 'RC-01',
    title: 'Customer Delight Award',
    recipient: 'Quality Assurance Squad',
    month: 'July 2026',
  },
  {
    id: 'RC-02',
    title: 'Spot Bonus — Critical Release',
    recipient: 'Platform Engineering',
    month: 'July 2026',
  },
];

export const funFact = {
  title: 'Did you know?',
  body: 'Teams that celebrate peer recognition weekly report 31% higher engagement scores in people surveys.',
};

export const wellnessTips = [
  {
    id: 'WL-01',
    title: 'Desk stretch break',
    body: 'Take a 3-minute stretch every 90 minutes to reduce shoulder strain.',
  },
  {
    id: 'WL-02',
    title: 'Hydration reminder',
    body: 'Aim for a glass of water before every stand-up — small habits compound.',
  },
];

export const newsletterTabs = ['All', 'Birthdays', 'Anniversaries', 'Company News'] as const;
export type NewsletterTab = (typeof newsletterTabs)[number];
