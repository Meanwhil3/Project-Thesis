// app/courses/[courseId]/exams/page.tsx
import { prisma } from "@/lib/prisma";
import ExamsOverviewClient from "@/components/Courses/Exams/ExamsOverviewClient";
import { mapExamToListItem } from "@/components/Courses/Exams/ExamListItem";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // ✅ ปรับ path ให้ตรงของคุณ
import { joinExamByCode } from "./server-actions";

type AppRole = "ADMIN" | "EXAMINER" | "TRAINEE";

export default async function ExamsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;

  if (!/^\d+$/.test(courseId)) {
    return <div className="p-6 text-red-600">courseId ไม่ถูกต้อง</div>;
  }

  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as AppRole | undefined;

  // ถ้ายังไม่ login จะให้ redirect ก็ได้ (หรือแสดงข้อความ)
  if (!session) {
    return <div className="p-6 text-red-600">กรุณาเข้าสู่ระบบ</div>;
  }

  const isTrainee = role === "TRAINEE";
  const canManage = !isTrainee;

  const courseIdBigInt = BigInt(courseId);

  const exams = await prisma.exams.findMany({
    where: {
      course_id: courseIdBigInt,
      deleted_at: null,
      // ✅ trainee ไม่ควรเห็นข้อสอบที่ซ่อน
      ...(isTrainee ? { exam_status: "SHOW" as any } : {}),
    },
    orderBy: { created_at: "desc" },
    select: {
      exam_id: true,
      exam_title: true,
      exam_type: true,
      created_at: true,
      exam_status: true,
      author: { select: { first_name: true } },
    },
  });

  const initialExams = exams.map(mapExamToListItem);

  // ✅ bind server action ให้ใช้กับ useFormState ใน client ได้
  const joinAction = joinExamByCode.bind(null, courseId);

  return (
    <ExamsOverviewClient
      courseId={courseId}
      initialExams={initialExams}
      canManage={canManage}
      joinExamAction={joinAction}
    />
  );
}
