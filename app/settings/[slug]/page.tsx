import { SettingsCategoryDetail } from '@/components/settings/settings-category-detail';
import { SETTINGS_CATEGORIES } from '@/components/settings/settings-data';

export function generateStaticParams() {
  return SETTINGS_CATEGORIES.map((item) => ({ slug: item.slug }));
}

export default async function SettingsCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <SettingsCategoryDetail slug={slug} />
      </div>
    </main>
  );
}
