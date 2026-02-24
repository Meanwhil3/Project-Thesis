// app/courses/[courseId]/exams/new/wood-fill/page.tsx
import WoodFillExamCreateClient from "./WoodFillExamCreateClient";

export const runtime = "nodejs";

export default async function NewWoodFillExamPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <WoodFillExamCreateClient courseId={courseId} />;
}
