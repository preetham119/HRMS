import { AppShell } from '@/components/layout/app-shell';
import '@/components/appraisal-system/index.css';
import 'react-toastify/dist/ReactToastify.css';

export default function PerformanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </AppShell>
  );
}
