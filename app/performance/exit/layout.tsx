import { ExitProvider } from '@/components/exit/exit-provider';

export default function PerformanceExitLayout({ children }: { children: React.ReactNode }) {
  return <ExitProvider>{children}</ExitProvider>;
}
