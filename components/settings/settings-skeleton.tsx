'use client';

export function SettingsLandingSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-36 rounded-[28px] bg-slate-200/80 dark:bg-slate-800" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-16 rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
          ))}
        </div>
        <div className="h-[420px] rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
      </div>
    </div>
  );
}
