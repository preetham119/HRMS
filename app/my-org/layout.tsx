import { AppShell } from '@/components/layout/app-shell';

export default function MyOrgLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
