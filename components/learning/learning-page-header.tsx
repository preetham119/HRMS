export function LearningPageHeader({
  eyebrow = 'Learning',
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
