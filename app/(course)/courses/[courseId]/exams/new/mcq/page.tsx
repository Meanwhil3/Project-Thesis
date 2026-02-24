// app/courses/[courseId]/exams/new/mcq/page.tsx
import McqExamCreateClient from "./McqExamCreateClient";

export const runtime = "nodejs";

export default async function NewMcqExamPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <McqExamCreateClient courseId={courseId} />;
}
