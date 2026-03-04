// app/api/courses/[courseId]/exams/[examId]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttemptStatus, ExamStatus, ExamType } from "@prisma/client";

function toBigInt(v: string | undefined): bigint | null {
  if (!v || !/^\d+$/.test(v)) return null;
  return BigInt(v);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; examId: string } },
) {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const u = session.user as any;
  const role = String(u?.role ?? "").toUpperCase();

  // เฉพาะ TRAINEE เท่านั้น
  if (role !== "TRAINEE") {
    return NextResponse.json(
      { ok: false, message: "ไม่มีสิทธิ์ส่งคำตอบ" },
      { status: 403 },
    );
  }

  // ─── Resolve userId ────────────────────────────────────────────────────────
  let userId: bigint | null = null;
  if (u.user_id && /^\d+$/.test(String(u.user_id))) {
    userId = BigInt(u.user_id);
  } else if (u.id && /^\d+$/.test(String(u.id))) {
    userId = BigInt(u.id);
  } else if (u.email) {
    const found = await prisma.user.findUnique({
      where: { email: String(u.email).toLowerCase() },
      select: { user_id: true, is_active: true },
    });
    if (!found?.is_active) {
      return NextResponse.json({ ok: false, message: "บัญชีไม่ได้เปิดใช้งาน" }, { status: 401 });
    }
    userId = found?.user_id ?? null;
  }
  if (!userId) {
    return NextResponse.json({ ok: false, message: "ไม่พบผู้ใช้" }, { status: 401 });
  }

  // ─── Parse params ──────────────────────────────────────────────────────────
  const courseIdBig = toBigInt(params.courseId);
  const examIdBig = toBigInt(params.examId);
  if (!courseIdBig || !examIdBig) {
    return NextResponse.json({ ok: false, message: "พารามิเตอร์ไม่ถูกต้อง" }, { status: 400 });
  }

  // ─── ตรวจ enrollment ────────────────────────────────────────────────────────
  const enrollment = await prisma.courseEnrollments.findFirst({
    where: { user_id: userId, course_id: courseIdBig, deleted_at: null },
    select: { enrollment_id: true },
  });
  if (!enrollment) {
    return NextResponse.json({ ok: false, message: "คุณไม่ได้ลงทะเบียนในคอร์สนี้" }, { status: 403 });
  }

  // ─── Parse body ────────────────────────────────────────────────────────────
  let answers: Record<string, string> = {};
  try {
    const body = await req.json();
    if (body?.answers && typeof body.answers === "object") {
      answers = body.answers as Record<string, string>;
    }
  } catch {
    return NextResponse.json({ ok: false, message: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const now = new Date();

  // ─── ดึงข้อสอบพร้อม is_correct (server-side เท่านั้น) ─────────────────────
  const exam = await prisma.exams.findFirst({
    where: {
      course_id: courseIdBig,
      exam_id: examIdBig,
      deleted_at: null,
      exam_status: ExamStatus.SHOW,
    },
    select: {
      exam_id: true,
      exam_type: true,
      duration_minute: true,
      open_at: true,
      close_at: true,
      questions: {
        where: { deleted_at: null },
        select: {
          question_id: true,
          score: true,
          choices: {
            where: { deleted_at: null },
            // ✅ is_correct + choice_detail อยู่ที่นี่เท่านั้น (server-side)
            select: { choice_id: true, is_correct: true, choice_detail: true },
          },
        },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ ok: false, message: "ไม่พบข้อสอบ" }, { status: 404 });
  }

  // ─── ตรวจว่าข้อสอบเปิดอยู่ ─────────────────────────────────────────────────
  if (exam.open_at && now < exam.open_at) {
    return NextResponse.json({ ok: false, message: "ข้อสอบยังไม่เปิด" }, { status: 403 });
  }
  if (exam.close_at && now > exam.close_at) {
    return NextResponse.json({ ok: false, message: "ข้อสอบปิดแล้ว" }, { status: 403 });
  }

  // ─── ดึง attempt ที่ยังไม่ได้ submit ─────────────────────────────────────────
  const attempt = await prisma.exam_Attempts.findFirst({
    where: {
      exam_id: examIdBig,
      user_id: userId,
      submit_datetime: null,
      deleted_at: null,
      attempt_status: AttemptStatus.IN_PROGRESS,
    },
    orderBy: { started_at: "desc" },
    select: { attempt_id: true, started_at: true },
  });

  if (!attempt) {
    return NextResponse.json(
      { ok: false, message: "ไม่พบ attempt หรือส่งคำตอบไปแล้ว" },
      { status: 409 },
    );
  }

  // ─── ตรวจว่าหมดเวลาหรือยัง (server-side) ────────────────────────────────────
  const perAttemptDeadline = new Date(
    attempt.started_at.getTime() + exam.duration_minute * 60_000,
  );
  const deadline = exam.close_at
    ? new Date(Math.min(perAttemptDeadline.getTime(), exam.close_at.getTime()))
    : perAttemptDeadline;

  // อนุญาต grace period 30 วินาที (กันกรณี network delay)
  const gracePeriodMs = 30_000;
  if (now > new Date(deadline.getTime() + gracePeriodMs)) {
    // Mark as completed (timeout) แต่ยังให้ score = 0
    await prisma.exam_Attempts.updateMany({
      where: { attempt_id: attempt.attempt_id, submit_datetime: null },
      data: {
        attempt_status: AttemptStatus.COMPLETED,
        submit_datetime: deadline,
        total_score: 0,
      },
    });
    return NextResponse.json({ ok: false, message: "หมดเวลาทำข้อสอบแล้ว" }, { status: 403 });
  }

  // ─── คำนวณคะแนน ─────────────────────────────────────────────────────────────
  let totalScore = 0;
  const examType = exam.exam_type ?? ExamType.MULTIPLE_CHOICE;

  for (const question of exam.questions) {
    const qId = question.question_id.toString();
    const userAnswer = answers[qId]?.trim() ?? "";

    if (examType === ExamType.MULTIPLE_CHOICE) {
      // MCQ: ตรวจว่า choice ที่เลือกถูกหรือไม่
      const selectedChoiceId = toBigInt(userAnswer);
      if (selectedChoiceId) {
        const selectedChoice = question.choices.find(
          (c) => c.choice_id === selectedChoiceId,
        );
        if (selectedChoice?.is_correct) {
          totalScore += Number(question.score ?? 0);
        }
      }
    } else {
      // FILL_IN_THE_BLANK: เปรียบเทียบกับรหัสคำตอบที่ถูกต้องใน choice_detail (is_correct=true)
      // normalize: trim + uppercase + ลบ whitespace ทั้งหมด
      const norm = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");
      const isCorrect = question.choices
        .filter((c) => c.is_correct)
        .some((c) => norm(userAnswer) === norm(c.choice_detail));
      if (isCorrect) totalScore += Number(question.score ?? 0);
    }
  }

  // ─── บันทึกผล (atomic update – ป้องกัน double-submit) ────────────────────────
  const updated = await prisma.exam_Attempts.updateMany({
    where: {
      attempt_id: attempt.attempt_id,
      user_id: userId, // double-check ownership
      submit_datetime: null, // ส่งได้ครั้งเดียว
      deleted_at: null,
    },
    data: {
      attempt_status: AttemptStatus.COMPLETED,
      total_score: totalScore,
      submit_datetime: now,
    },
  });

  if (updated.count === 0) {
    // มีคน submit ไปก่อนแล้ว (race condition / double-click)
    return NextResponse.json(
      { ok: false, message: "ส่งคำตอบไปแล้ว ไม่สามารถส่งซ้ำได้" },
      { status: 409 },
    );
  }

  const totalPossible = exam.questions.reduce(
    (sum, q) => sum + Number(q.score ?? 0),
    0,
  );

  return NextResponse.json({
    ok: true,
    score: totalScore,
    total: totalPossible,
  });
}