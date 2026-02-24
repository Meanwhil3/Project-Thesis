// app/courses/[courseId]/exams/[examId]/take/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttemptStatus, ExamStatus, ExamType } from "@prisma/client";

import TakeExamClient, { type TakeExamModel } from "./TakeExamClient";

export const dynamic = "force-dynamic";

function toBigIntOrRedirect(v: string) {
  if (!/^\d+$/.test(v)) redirect("/404");
  return BigInt(v);
}

function fmtThai(d: Date) {
  return d.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pickAttemptStatus(keys: string[]) {
  const en = AttemptStatus as any;
  for (const k of keys) if (en?.[k]) return en[k] as AttemptStatus;
  return undefined;
}

export default async function TakePage({
  params,
}: {
  params: Promise<{ courseId: string; examId: string }>;
}) {
  const { courseId, examId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const u = session.user as any;
  const role = String(u?.role ?? "").toUpperCase();
  if (role !== "TRAINEE") redirect("/forbidden");

  const courseIdBig = toBigIntOrRedirect(courseId);
  const examIdBig = toBigIntOrRedirect(examId);

  // หา user_id จาก session
  let userId: bigint | null = null;
  if (u.user_id && /^\d+$/.test(String(u.user_id))) userId = BigInt(u.user_id);
  else if (u.id && /^\d+$/.test(String(u.id))) userId = BigInt(u.id);
  else if (u.email) {
    const found = await prisma.user.findUnique({
      where: { email: String(u.email).toLowerCase() },
      select: { user_id: true },
    });
    userId = found?.user_id ?? null;
  }
  if (!userId) redirect("/login");

  const now = new Date();

  // ✅ ดึงข้อสอบ (TRAINEE เห็นเฉพาะ SHOW) + schedule open/close
  // ✅ ไม่ส่งเฉลย (ไม่ select is_correct)
  const exam = await prisma.exams.findFirst({
    where: {
      course_id: courseIdBig,
      exam_id: examIdBig,
      deleted_at: null,
      exam_status: ExamStatus.SHOW,
    },
    select: {
      exam_id: true,
      exam_title: true,
      exam_description: true,
      exam_type: true,
      duration_minute: true,
      open_at: true,
      close_at: true,
      questions: {
        where: { deleted_at: null },
        orderBy: { question_id: "asc" },
        select: {
          question_id: true,
          question_detail: true,
          score: true,
          choices: {
            where: { deleted_at: null },
            orderBy: { choice_id: "asc" },
            select: { choice_id: true, choice_detail: true },
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

  // ✅ เช็คช่วงเวลาเปิด–ปิดข้อสอบ (ระดับข้อสอบ)
  if (exam.open_at && now < exam.open_at) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center">
          <div className="text-lg font-medium text-[#14532D]">ข้อสอบยังไม่เปิด</div>
          <div className="mt-2 text-sm text-[#14532D]/70">
            เปิดทำข้อสอบได้ตั้งแต่: <b>{fmtThai(exam.open_at)}</b>
          </div>
        </div>
      </div>
    );
  }

  if (exam.close_at && now > exam.close_at) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center">
          <div className="text-lg font-medium text-[#14532D]">ข้อสอบปิดแล้ว</div>
          <div className="mt-2 text-sm text-[#14532D]/70">
            ปิดเมื่อ: <b>{fmtThai(exam.close_at)}</b>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ดึง attempt ที่กำลังทำอยู่ (ยังไม่ submit)
  const existing = await prisma.exam_Attempts.findFirst({
    where: {
      exam_id: examIdBig,
      user_id: userId,
      submit_datetime: null,
      deleted_at: null,
    },
    orderBy: { started_at: "desc" },
    select: { attempt_id: true, started_at: true },
  });

  const inProgress = pickAttemptStatus(["IN_PROGRESS", "DOING", "STARTED"]);

  const attempt =
    existing ??
    (await prisma.exam_Attempts.create({
      data: {
        exam: { connect: { exam_id: examIdBig } },
        user: { connect: { user_id: userId } },
        total_score: 0,
        started_at: now,
        ...(inProgress ? { attempt_status: inProgress } : {}),
      },
      select: { attempt_id: true, started_at: true },
    }));

  // ✅ คำนวณ deadline (หมดเวลาจริง) = min(started_at+duration, close_at ถ้ามี)
  const perAttemptDeadline = new Date(
    attempt.started_at.getTime() + exam.duration_minute * 60_000,
  );
  const deadline = exam.close_at
    ? new Date(Math.min(perAttemptDeadline.getTime(), exam.close_at.getTime()))
    : perAttemptDeadline;

  // ✅ ถ้าหมดเวลาแล้ว ให้ “เข้าไม่ได้/ทำต่อไม่ได้”
  if (now > deadline) {
    const expired = pickAttemptStatus(["EXPIRED", "TIME_EXPIRED", "TIMEOUT"]);
    if (expired) {
      // best-effort mark expired (ไม่ทำให้หน้า crash)
      await prisma.exam_Attempts.updateMany({
        where: {
          attempt_id: attempt.attempt_id,
          submit_datetime: null,
          deleted_at: null,
        },
        data: { attempt_status: expired },
      });
    }

    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center">
          <div className="text-lg font-medium text-[#14532D]">หมดเวลาทำข้อสอบแล้ว</div>
          <div className="mt-2 text-sm text-[#14532D]/70">
            หมดเวลาเมื่อ: <b>{fmtThai(deadline)}</b>
          </div>
        </div>
      </div>
    );
  }

  const examType = (exam.exam_type ?? ExamType.MULTIPLE_CHOICE) as ExamType;

  const model: TakeExamModel = {
    attemptId: attempt.attempt_id.toString(),
    id: exam.exam_id.toString(),
    title: exam.exam_title,
    description: exam.exam_description ?? null,
    examType,
    durationMinute: exam.duration_minute,
    startedAtISO: attempt.started_at.toISOString(),
    deadlineISO: deadline.toISOString(),
    questions: (exam.questions ?? []).map((q) => ({
      id: q.question_id.toString(),
      detail: q.question_detail,
      score: Number(q.score ?? 0),
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
      exam={model}
      backHref={`/courses/${courseId}/exams`}
      submitEndpoint={`/api/courses/${courseId}/exams/${model.id}/submit`}
    />
  );
}
