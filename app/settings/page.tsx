'use client';

import { SettingsLanding } from '@/components/settings/settings-landing';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <SettingsLanding />
      </div>
    </main>
  );
}
