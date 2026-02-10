import ExamsOverviewClient from "@/components/Courses/Exams/ExamsOverviewClient";

export const runtime = "nodejs";

export default async function ExamsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <ExamsOverviewClient courseId={courseId} />;
}
