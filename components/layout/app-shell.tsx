"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeIndianRupee,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronLeft,
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
  Package,
  PanelLeftClose,
  PanelLeftOpen,
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
import { getBrandingSettings, getOrganizationSettings } from '@/lib/settings';
import { getRoleLabel, normalizeAppRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'hrms-sidebar-collapsed';

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
  Package,
} as const;

/** Soft bubble colors used only when the sidebar is collapsed. */
const collapsedIconBubble: Record<keyof typeof iconMap, string> = {
  LayoutGrid: 'bg-sky-100 text-sky-600 ring-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800/60',
  UserCircle2: 'bg-violet-100 text-violet-600 ring-violet-200/80 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-800/60',
  FileText: 'bg-emerald-100 text-emerald-600 ring-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60',
  CalendarRange: 'bg-amber-100 text-amber-600 ring-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/60',
  Wallet2: 'bg-rose-100 text-rose-600 ring-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800/60',
  GraduationCap: 'bg-indigo-100 text-indigo-600 ring-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800/60',
  BookOpen: 'bg-cyan-100 text-cyan-600 ring-cyan-200/80 dark:bg-cyan-950/60 dark:text-cyan-300 dark:ring-cyan-800/60',
  ClipboardList: 'bg-teal-100 text-teal-600 ring-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:ring-teal-800/60',
  Sparkles: 'bg-fuchsia-100 text-fuchsia-600 ring-fuchsia-200/80 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:ring-fuchsia-800/60',
  Settings: 'bg-slate-200 text-slate-700 ring-slate-300/80 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600/60',
  ShieldCheck: 'bg-blue-100 text-blue-600 ring-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800/60',
  HelpCircle: 'bg-orange-100 text-orange-600 ring-orange-200/80 dark:bg-orange-950/60 dark:text-orange-300 dark:ring-orange-800/60',
  MailPlus: 'bg-pink-100 text-pink-600 ring-pink-200/80 dark:bg-pink-950/60 dark:text-pink-300 dark:ring-pink-800/60',
  Users: 'bg-lime-100 text-lime-700 ring-lime-200/80 dark:bg-lime-950/60 dark:text-lime-300 dark:ring-lime-800/60',
  DoorOpen: 'bg-red-100 text-red-600 ring-red-200/80 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-800/60',
  FilePenLine: 'bg-purple-100 text-purple-600 ring-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:ring-purple-800/60',
  MessagesSquare: 'bg-sky-100 text-sky-700 ring-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800/60',
  BadgeIndianRupee: 'bg-yellow-100 text-yellow-700 ring-yellow-200/80 dark:bg-yellow-950/60 dark:text-yellow-300 dark:ring-yellow-800/60',
  Building2: 'bg-brand-100 text-brand-700 ring-brand-200/80 dark:bg-brand-950/60 dark:text-brand-300 dark:ring-brand-800/60',
  Package: 'bg-cyan-100 text-cyan-700 ring-cyan-200/80 dark:bg-cyan-950/60 dark:text-cyan-300 dark:ring-cyan-800/60',
};

function getCollapsedBubble(iconName: string) {
  return (
    collapsedIconBubble[iconName as keyof typeof collapsedIconBubble] ??
    'bg-slate-100 text-slate-600 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  );
}

function CollapsedNavBubble({
  active,
  iconName,
  children,
}: {
  active: boolean;
  iconName: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 transition-all duration-200',
        'group-hover:scale-110 group-hover:shadow-md group-active:scale-95',
        getCollapsedBubble(iconName),
        active && 'scale-105 shadow-md ring-2',
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200',
          'bg-white/35 group-hover:opacity-100',
          active && 'opacity-40',
        )}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}

function isExactOverviewRoute(href: string) {
  return href === '/learning' || href === '/help-desk' || href === '/performance';
}

function collectNavHrefs(items: NavItem[]): string[] {
  const hrefs: string[] = [];
  for (const item of items) {
    if (item.href) hrefs.push(item.href);
    if (item.children?.length) hrefs.push(...collectNavHrefs(item.children));
  }
  return hrefs;
}

/** Prefer the longest matching nav href so /settings/team activates Team, not Settings. */
function isHrefActive(pathname: string, href: string | undefined, allHrefs: string[]) {
  if (!href) return false;
  if (isExactOverviewRoute(href)) {
    return pathname === href;
  }

  const matches = pathname === href || pathname.startsWith(`${href}/`);
  if (!matches) return false;

  const hasMoreSpecificSibling = allHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );

  return !hasMoreSpecificSibling;
}

function isItemActive(pathname: string, item: NavItem, allHrefs: string[]): boolean {
  if (item.href) {
    return isHrefActive(pathname, item.href, allHrefs);
  }
  return Boolean(item.children?.some((child) => isItemActive(pathname, child, allHrefs)));
}

function firstNavHref(item: NavItem): string | undefined {
  if (item.href) return item.href;
  for (const child of item.children ?? []) {
    const href = firstNavHref(child);
    if (href) return href;
  }
  return undefined;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, isReady, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const role = normalizeAppRole(user?.role);
  const navItems = getMenuForRole(role);
  const allNavHrefs = collectNavHrefs(navItems);
  const companyLabel =
    user?.companyName?.trim() ||
    getOrganizationSettings().companyName?.trim() ||
    getBrandingSettings().portalName?.trim() ||
    'HRMS';
  const portalBrandLabel = getPortalBrandLabel(role);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === '0') setCollapsed(false);
      if (stored === '1') setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (token && !user) {
      router.replace('/no-access');
    }
  }, [isReady, token, user, router]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const merged = { ...prev };
      const markOpen = (items: NavItem[], prefix = '') => {
        items.forEach((item) => {
          const key = prefix ? `${prefix}::${item.label}` : item.label;
          if (item.children?.length && isItemActive(pathname, item, allNavHrefs)) {
            merged[key] = true;
            if (prefix) merged[prefix] = true;
          }
          if (item.children?.length) {
            markOpen(item.children, key);
          }
        });
      };
      markOpen(navItems);
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

  const renderNavChildren = (items: NavItem[], groupKey: string, depth = 0) => (
    <div className={cn('space-y-1', depth > 0 ? 'ml-3 border-l border-slate-200 pl-3 dark:border-slate-700' : 'ml-3 border-l border-slate-200 pl-3 dark:border-slate-700')}>
      {items.map((child) => {
        const ChildIcon = iconMap[child.icon as keyof typeof iconMap] ?? ChevronRight;
        const childKey = `${groupKey}::${child.label}`;
        const hasNestedChildren = Boolean(child.children?.length);

        if (hasNestedChildren) {
          const nestedOpen = openGroups[childKey] ?? isItemActive(pathname, child, allNavHrefs);
          const nestedActive = isItemActive(pathname, child, allNavHrefs);
          return (
            <div key={childKey} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(childKey)}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                  nestedActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <span className="flex items-center gap-3">
                  <ChildIcon className="h-3.5 w-3.5" />
                  {child.label}
                </span>
                <ChevronDown className={cn('h-3.5 w-3.5 transition', nestedOpen ? 'rotate-180' : '')} />
              </button>
              {nestedOpen && renderNavChildren(child.children!, childKey, depth + 1)}
            </div>
          );
        }

        const childActive = isHrefActive(pathname, child.href, allNavHrefs);
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
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-3 py-3 lg:flex-row lg:px-6 lg:py-6">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'w-full rounded-[32px] border border-slate-200 bg-white/85 p-3 shadow-sm backdrop-blur transition-all dark:border-slate-700 dark:bg-slate-900/90 lg:shrink-0',
            collapsed ? 'lg:w-[88px]' : 'lg:w-72 lg:p-4',
          )}
        >
          <div
            className={cn(
              'flex items-center rounded-[24px] bg-slate-950 text-white dark:bg-slate-800',
              collapsed ? 'justify-center p-3' : 'gap-3 p-4',
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Building2 className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{companyLabel}</p>
                <p className="truncate text-xs text-slate-400">{portalBrandLabel}</p>
              </div>
            )}
          </div>

          <div className={cn('mt-3 flex', collapsed ? 'justify-center' : 'justify-end')}>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutGrid;
              const hasChildren = Boolean(item.children?.length);

              if (hasChildren) {
                const open = !collapsed && (openGroups[item.label] ?? isItemActive(pathname, item, allNavHrefs));
                const groupActive = isItemActive(pathname, item, allNavHrefs);
                const firstChildHref = firstNavHref(item);

                if (collapsed) {
                  return (
                    <Link
                      key={item.label}
                      href={(firstChildHref ?? '#') as any}
                      title={item.label}
                      className="group flex items-center justify-center rounded-2xl px-1 py-1.5 transition"
                    >
                      <CollapsedNavBubble active={groupActive} iconName={item.icon}>
                        <Icon className="h-4 w-4" />
                      </CollapsedNavBubble>
                    </Link>
                  );
                }

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
                    {open && renderNavChildren(item.children!, item.label)}
                  </div>
                );
              }

              const active = isHrefActive(pathname, item.href, allNavHrefs);

              if (collapsed) {
                return (
                  <Link
                    key={item.href ?? item.label}
                    href={(item.href ?? '#') as any}
                    title={item.label}
                    className="group flex items-center justify-center rounded-2xl px-1 py-1.5 transition"
                  >
                    <CollapsedNavBubble active={active} iconName={item.icon}>
                      <Icon className="h-4 w-4" />
                    </CollapsedNavBubble>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href ?? item.label}
                  href={(item.href ?? '#') as any}
                  title={item.label}
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

          {!collapsed && (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Need help?</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Contact the IT Service Desk for urgent assistance.
              </p>
              <button
                type="button"
                onClick={() => router.push('/help-desk/raise')}
                className="mt-4 flex w-full items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
              >
                <HelpCircle className="h-4 w-4" />
                Raise ticket
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Logout"
            className={cn(
              'mt-6 flex w-full items-center rounded-2xl border border-red-200 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30',
              collapsed ? 'justify-center px-2 py-3' : 'justify-center gap-2 px-3 py-3',
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Logout'}
          </button>
        </motion.aside>

        <main className="min-w-0 flex-1">
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur transition-colors dark:border-slate-700 dark:bg-slate-900/90"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
                >
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <Search className="h-4 w-4" />
                  <input
                    className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:text-slate-200"
                    placeholder="Search portal"
                  />
                </label>
              </div>
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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-600 text-sm font-semibold text-white">
                    {user?.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profilePicture}
                        alt={user?.name ?? 'Profile'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (user?.name ?? user?.email ?? 'E')
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.name ?? (user?.email ? user.email.split('@')[0] : 'Employee')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.role ? getRoleLabel(user.role) : 'Employee-PR'}
                    </p>
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
