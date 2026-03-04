import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import ExamEditClient, { type ExamEditInitial } from "./ExamEditClient";
import { ExamType, ExamStatus } from "@prisma/client";

function toBigInt(v: string) {
  if (!/^\d+$/.test(v)) throw new Error("invalid");
  return BigInt(v);
}

export default async function ExamEditPage({
  params,
}: {
  params: { courseId: string; examId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = String((session.user as any)?.role ?? "").toUpperCase();
  if (role === "TRAINEE") redirect(`/courses/${params.courseId}/exams`);

  const courseIdBigInt = toBigInt(params.courseId);
  const examIdBigInt = toBigInt(params.examId);

  const exam = await prisma.exams.findFirst({
    where: {
      exam_id: examIdBigInt,
      course_id: courseIdBigInt,
      deleted_at: null,
    },
    select: {
      exam_id: true,
      exam_title: true,
      exam_description: true,
      exam_type: true,      // ExamType | null
      duration_minute: true,
      exam_status: true,    // ExamStatus | null
      questions: {
        where: { deleted_at: null },
        orderBy: { question_id: "asc" },
        select: {
          question_id: true,
          score: true,
          question_detail: true,
          choices: {
            where: { deleted_at: null },
            orderBy: { choice_id: "asc" },
            select: { choice_id: true, choice_detail: true, is_correct: true },
          },
        },
      },
    },
  });

  if (!exam) return <div className="p-6 text-red-600">ไม่พบข้อสอบ</div>;

  // ✅ ทำให้ไม่ null (สำคัญสุดที่ทำให้แดง)
  const dto: ExamEditInitial = {
    courseId: params.courseId,
    examId: params.examId,
    exam_title: exam.exam_title,
    exam_description: exam.exam_description ?? "",
    exam_type: exam.exam_type ?? ExamType.MULTIPLE_CHOICE,
    duration_minute: exam.duration_minute,
    exam_status: exam.exam_status ?? ExamStatus.HIDE,
    questions: exam.questions.map((q) => ({
      question_id: q.question_id.toString(),
      score: q.score,
      question_detail: q.question_detail,
      choices: q.choices.map((c) => ({
        choice_id: c.choice_id.toString(),
        choice_detail: c.choice_detail,
        is_correct: !!c.is_correct,
      })),
    })),
  };

  return <ExamEditClient initial={dto} />;
}
