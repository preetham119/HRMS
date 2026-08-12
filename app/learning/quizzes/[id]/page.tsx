import QuizzesPanel from '@/components/learning/quizzes-panel';

export default async function LearningQuizDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuizzesPanel quizId={Number(id)} />;
}
