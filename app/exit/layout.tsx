import { AppShell } from '@/components/layout/app-shell';
import { ExitProvider } from '@/components/exit/exit-provider';

export default function ExitLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <ExitProvider>
        <main className="min-h-[calc(100vh-8rem)] bg-transparent p-1 sm:p-2">{children}</main>
      </ExitProvider>
    </AppShell>
  );
}
