// app/courses/[courseId]/exams/[examId]/take/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import TakeExamClient, { type TakeExamModel } from "./TakeExamClient";
import { ExamStatus, ExamType } from "@prisma/client";

export const dynamic = "force-dynamic";

function isNumericId(v: string) {
  return /^\d+$/.test(v);
}

export default async function TakeExamPage({
  params,
}: {
  params: { courseId: string; examId: string };
}) {
  // ✅ ต้อง login
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // ✅ หน้านี้สำหรับ TRAINEE เท่านั้น
  const role = (session.user as any)?.role as string | undefined;
  if (role !== "TRAINEE") redirect("/forbidden");

  const { courseId, examId } = params;

  if (!isNumericId(courseId) || !isNumericId(examId)) {
    return <div className="p-6 text-red-600">พารามิเตอร์ไม่ถูกต้อง</div>;
  }

  const courseIdBigInt = BigInt(courseId);
  const examIdBigInt = BigInt(examId);

  // ✅ ดึงข้อสอบแบบไม่ส่งเฉลย (ไม่ select is_correct)
  const exam = await prisma.exams.findFirst({
    where: {
      course_id: courseIdBigInt,
      exam_id: examIdBigInt,
      deleted_at: null,
      exam_status: ExamStatus.SHOW,
    },
    select: {
      exam_id: true,
      exam_title: true,
      exam_description: true,
      exam_type: true,
      duration_minute: true,
      questions: {
        select: {
          question_id: true,
          question_detail: true,
          score: true,
          choices: {
            select: {
              choice_id: true,
              choice_detail: true,
              // ❌ ห้าม select is_correct
            },
          },
        },
      },
    },
  });

  if (!exam) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center text-sm text-[#14532D]/70">
          ไม่พบข้อสอบ หรือข้อสอบยังไม่ถูกเผยแพร่
        </div>
      </div>
    );
  }

  // ✅ BigInt -> string ก่อนส่งเข้า client
  const examType = (exam.exam_type ?? ExamType.MULTIPLE_CHOICE) as ExamType;

  const examModel: TakeExamModel = {
    id: exam.exam_id.toString(),
    title: exam.exam_title,
    description: exam.exam_description ?? null,
    examType: examType as any, // "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK"
    durationMinute: exam.duration_minute,
    startedAtISO: new Date().toISOString(), // ถ้าอยากไม่รีเซ็ตตอน refresh ค่อยทำ Attempt ทีหลัง
    questions: (exam.questions ?? []).map((q) => ({
      id: q.question_id.toString(),
      detail: q.question_detail,
      score: Number(q.score ?? 0),
      // ✅ MCQ เท่านั้นที่ส่ง choices
      choices:
        examType === ExamType.MULTIPLE_CHOICE
          ? (q.choices ?? []).map((c) => ({
              id: c.choice_id.toString(),
              detail: c.choice_detail,
            }))
          : undefined,
    })),
  };

  return (
    <TakeExamClient
      courseId={courseId}
      exam={examModel}
      backHref={`/courses/${courseId}/exams`} // ✅ ไม่มีลิงก์ create/edit แน่นอน
      // submitEndpoint={`/api/courses/${courseId}/exams/${examModel.id}/submit`}
    />
  );
}
