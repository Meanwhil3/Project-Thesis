// app/courses/[courseId]/exams/new/wood-fill/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import WoodFillExamCreateClient from "./WoodFillExamCreateClient";

export const runtime = "nodejs";

export default async function NewWoodFillExamPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = String((session.user as any)?.role ?? "").toUpperCase();
  const { courseId } = await params;
  if (role === "TRAINEE") redirect(`/courses/${courseId}/exams`);

  return <WoodFillExamCreateClient courseId={courseId} />;
}
