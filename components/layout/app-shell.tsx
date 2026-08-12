"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeIndianRupee,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  FilePenLine,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutGrid,
  LogOut,
  MailPlus,
  MessagesSquare,
  MoonStar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SunMedium,
  UserCircle2,
  Users,
  CalendarRange,
  Wallet2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { getMenuForRole, getPortalBrandLabel, type NavItem } from '@/lib/rbac';
import { getBrandingSettings } from '@/lib/settings';
import type { AppRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

const iconMap = {
  LayoutGrid,
  UserCircle2,
  FileText,
  CalendarRange,
  Wallet2,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Sparkles,
  Settings,
  ShieldCheck,
  HelpCircle,
  MailPlus,
  Users,
  DoorOpen,
  FilePenLine,
  MessagesSquare,
  BadgeIndianRupee,
  Building2,
} as const;

function isExactOverviewRoute(href: string) {
  return href === '/learning' || href === '/help-desk';
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.href) {
    if (isExactOverviewRoute(item.href)) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return Boolean(item.children?.some((child) => child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, isReady, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const role = (user?.role?.toUpperCase() as AppRole | undefined) ?? 'EMPLOYEE';
  const navItems = getMenuForRole(role);
  const companyLabel = user?.companyName?.trim() || getBrandingSettings().portalName || 'HRMS';
  const portalBrandLabel = `${companyLabel} · ${getPortalBrandLabel(role)}`;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isReady) return;
    if (token && !user) {
      router.replace('/no-access');
    }
  }, [isReady, token, user, router]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const merged = { ...prev };
      navItems.forEach((item) => {
        if (item.children?.length && isItemActive(pathname, item)) {
          merged[item.label] = true;
        }
      });
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-3 lg:flex-row lg:px-6 lg:py-6">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full rounded-[32px] border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur transition-colors dark:border-slate-700 dark:bg-slate-900/90 lg:w-72 lg:shrink-0"
        >
          <div className="flex items-center gap-3 rounded-[24px] bg-slate-950 p-4 text-white dark:bg-slate-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{companyLabel}</p>
              <p className="text-xs text-slate-400">{portalBrandLabel}</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutGrid;
              const hasChildren = Boolean(item.children?.length);

              if (hasChildren) {
                const open = openGroups[item.label] ?? isItemActive(pathname, item);
                const groupActive = isItemActive(pathname, item);
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition',
                        groupActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <ChevronDown className={cn('h-4 w-4 transition', open ? 'rotate-180' : '')} />
                    </button>
                    {open && (
                      <div className="ml-3 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
                        {item.children!.map((child) => {
                          const ChildIcon = iconMap[child.icon as keyof typeof iconMap] ?? ChevronRight;
                          const childActive = Boolean(
                            child.href &&
                              (isExactOverviewRoute(child.href)
                                ? pathname === child.href
                                : pathname === child.href || pathname.startsWith(`${child.href}/`)),
                          );
                          return (
                            <Link
                              key={child.href ?? child.label}
                              href={(child.href ?? '#') as any}
                              className={cn(
                                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                                childActive
                                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                              )}
                            >
                              <ChildIcon className="h-3.5 w-3.5" />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = Boolean(item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)));
              return (
                <Link
                  key={item.href ?? item.label}
                  href={(item.href ?? '#') as any}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition',
                    active
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {active && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Need help?</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Contact the IT Service Desk for urgent assistance.</p>
            <button
              type="button"
              onClick={() => router.push('/help-desk/raise')}
              className="mt-4 flex w-full items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
            >
              <HelpCircle className="h-4 w-4" />
              Raise ticket
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </motion.aside>

        <main className="flex-1">
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur transition-colors dark:border-slate-700 dark:bg-slate-900/90"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                <Search className="h-4 w-4" />
                <input
                  className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:text-slate-200"
                  placeholder="Search portal"
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600 text-sm font-semibold text-white">
                    {(user?.name ?? user?.email ?? 'E')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.name ?? (user?.email ? user.email.split('@')[0] : 'Employee')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role ?? 'EMPLOYEE'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
