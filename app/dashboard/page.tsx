'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarRange, FileText, GraduationCap, HelpCircle, Settings, Sparkles, UserCircle2, Wallet2 } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import HeroDashboard from '@/components/dashboard/HeroDashboard';

const employee = {
  name: 'Rajesh Kumar',
  employeeId: 'EMP00125',
  designation: 'Senior QA Lead',
  department: 'Quality Assurance',
  manager: 'John Smith',
  managerEmail: 'john.smith@Rockstar.com',
  location: 'Hyderabad, India',
  employmentType: 'Full Time',
  joiningDate: '12-Jan-2024',
  status: 'Active',
  leaveBalance: { annual: 18, casual: 7, sick: 5, compOff: 3, lop: 0 },
};

const quickLinks = [
  { title: 'My Profile', href: '/profile' as const, icon: UserCircle2, description: 'Manage personal and professional details', color: 'from-brand-500 to-brand-700' },
  { title: 'Documents', href: '/documents' as const, icon: FileText, description: 'Upload and organize official documents', color: 'from-emerald-400 to-emerald-600' },
  { title: 'Leave Management', href: '/leave' as const, icon: CalendarRange, description: 'Apply and track leave requests', color: 'from-violet-500 to-violet-700' },
  { title: 'Payroll', href: '/payroll' as const, icon: Wallet2, description: 'View salary slips and payslips', color: 'from-rose-500 to-rose-700' },
  { title: 'Performance', href: '/performance' as const, icon: Sparkles, description: 'Monitor goals and appraisals', color: 'from-fuchsia-500 to-fuchsia-700' },
  { title: 'Learning', href: '/learning' as const, icon: GraduationCap, description: 'Upskill with curated learning', color: 'from-sky-500 to-sky-700' },
  { title: 'IT Service Desk', href: '/help-desk' as const, icon: HelpCircle, description: 'Raise support tickets quickly', color: 'from-slate-600 to-slate-800' },
  { title: 'Settings', href: '/settings' as const, icon: Settings, description: 'Update preferences and notifications', color: 'from-lime-500 to-lime-700' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function DashboardContent() {
  const greeting = useMemo(() => getGreeting(), []);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('unauthorized') === '1';

  // lightweight dashboard data saved previously
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('dashboardData', JSON.stringify({ reportingEmail: employee.managerEmail }));
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {isUnauthorized ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            Unauthorized Access
          </div>
        ) : null}
        {/* Replaced old hero with premium HeroDashboard */}
        <HeroDashboard
          employeeId={employee.employeeId}
          name={user?.email ? user.email.split('@')[0] : employee.name}
          designation={employee.designation}
          department={employee.department}
          location={employee.location}
          lastLogin={undefined}
        />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Quick access</p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Everything you need</h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group"
                >
                  <Link href={item.href} className="block rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className={`inline-flex rounded-2xl bg-gradient-to-br ${item.color} p-3 text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950" />}> 
      <DashboardContent />
    </Suspense>
  );
}
