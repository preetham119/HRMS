import CourseDetails from '@/components/learning/course-details';

export default async function LearningCourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseDetails courseId={Number(id)} />;
}
