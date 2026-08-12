import { AppShell } from '@/components/layout/app-shell';

export default function MyTeamLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
