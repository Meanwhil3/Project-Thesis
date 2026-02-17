import { prisma } from "@/lib/prisma";
import ExamsOverviewClient from "@/components/Courses/Exams/ExamsOverviewClient";
import { mapExamToListItem } from "@/components/Courses/Exams/ExamListItem";

export default async function ExamsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;

  if (!/^\d+$/.test(courseId)) {
    return <div className="p-6 text-red-600">courseId ไม่ถูกต้อง</div>;
  }

  const courseIdBigInt = BigInt(courseId);

  const exams = await prisma.exams.findMany({
    where: { course_id: courseIdBigInt, deleted_at: null },
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

  return <ExamsOverviewClient courseId={courseId} initialExams={initialExams} />;
}
