import { GreetComposePage } from '@/components/newsletter/greet-compose-page';
import { isGreetType } from '@/components/newsletter/greet-utils';
import { employees, newJoiners } from '@/components/newsletter/newsletter-data';

export function generateStaticParams() {
  const birthdayAndAnniversary = employees.flatMap((person) => [
    { type: 'birthday', id: person.id },
    { type: 'anniversary', id: person.id },
  ]);
  const welcome = newJoiners.map((person) => ({ type: 'welcome', id: person.id }));
  return [...birthdayAndAnniversary, ...welcome];
}

export default async function NewsletterGreetPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const resolved = await params;
  const type = isGreetType(resolved.type) ? resolved.type : null;

  if (!type) {
    return (
      <main className="min-h-screen bg-[#f4f6f8] p-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">Invalid greeting type</p>
          <a href="/newsletter" className="mt-3 inline-block text-sm font-semibold text-brand-700 underline">
            Back to Newsletter
          </a>
        </div>
      </main>
    );
  }

  return <GreetComposePage type={type} personId={resolved.id} />;
}
