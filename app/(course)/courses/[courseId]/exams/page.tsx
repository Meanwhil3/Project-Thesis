// app/courses/[courseId]/exams/page.tsx
import { prisma } from "@/lib/prisma";
import ExamsOverviewClient from "@/components/Courses/Exams/ExamsOverviewClient";
// import { mapExamToListItem } from "@/components/Courses/Exams/ExamListItem";
import { mapExamToListItem } from "@/lib/exams/mapExamToListItem";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ExamStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Role = "ADMIN" | "EXAMINER" | "TRAINEE";

export default async function ExamsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  if (!/^\d+$/.test(courseId)) {
    return <div className="p-6 text-red-600">courseId ไม่ถูกต้อง</div>;
  }

  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-6 text-red-600">กรุณาเข้าสู่ระบบ</div>;

  const role = (session.user as any)?.role as Role | undefined;

  // ✅ allow-list เท่านั้น (role หาย = ไม่ให้จัดการ)
  const canManage = role === "ADMIN" || role === "EXAMINER";
  const isTrainee = role === "TRAINEE";

  const userId = (session.user as any)?.id || (session.user as any)?.user_id || (session.user as any)?.sub;

  const exams = await prisma.exams.findMany({
    where: {
      course_id: BigInt(courseId),
      deleted_at: null,
      ...(isTrainee ? { exam_status: ExamStatus.SHOW } : {}),
    },
    orderBy: { created_at: "desc" },
    select: {
      exam_id: true,
      exam_title: true,
      exam_type: true,
      created_at: true,
      exam_status: true,
      open_at: true,
      close_at: true,
      author: { select: { first_name: true } },
      ...(userId
        ? {
            attempts: {
              where: {
                user_id: BigInt(userId),
                deleted_at: null,
              },
              select: {
                attempt_status: true,
                total_score: true,
              },
              orderBy: { started_at: "desc" as const },
              take: 1,
            },
          }
        : {}),
    },
  });

  return (
    <ExamsOverviewClient
      courseId={courseId}
      initialExams={exams.map(mapExamToListItem)}
      canManage={canManage}
    />
  );
}
