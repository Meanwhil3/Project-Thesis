// app/api/courses/[courseId]/exams/[examId]/submit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AttemptStatus, ExamStatus, ExamType } from "@prisma/client";

function toBigInt(v: string) {
  if (!/^\d+$/.test(v)) throw new Error("invalid");
  return BigInt(v);
}

function pickAttemptStatus(keys: string[]) {
  const en = AttemptStatus as any;
  for (const k of keys) if (en?.[k]) return en[k] as AttemptStatus;
  return undefined;
}

async function getTraineeUserId(): Promise<bigint> {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u) throw new Error("unauthorized");

  const role = String(u.role ?? "").toUpperCase();
  if (role !== "TRAINEE") throw new Error("forbidden");

  if (u.user_id && /^\d+$/.test(String(u.user_id))) return BigInt(u.user_id);
  if (u.id && /^\d+$/.test(String(u.id))) return BigInt(u.id);

  if (u.email) {
    const found = await prisma.user.findUnique({
      where: { email: String(u.email).toLowerCase() },
      select: { user_id: true },
    });
    if (found?.user_id) return found.user_id;
  }

  throw new Error("unauthorized");
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ courseId: string; examId: string }> },
) {
  try {
    const { courseId, examId } = await ctx.params;
    const courseIdBig = toBigInt(courseId);
    const examIdBig = toBigInt(examId);
    const userId = await getTraineeUserId();

    const body = await req.json().catch(() => ({}));
    const answers = (body?.answers ?? {}) as Record<string, string>;

    const now = new Date();
    const GRACE_MS = 10_000; // กัน network delay เล็กน้อย

    // ✅ ดึงข้อสอบ + เฉลย (server only) + schedule
    const exam = await prisma.exams.findFirst({
      where: {
        course_id: courseIdBig,
        exam_id: examIdBig,
        deleted_at: null,
        exam_status: ExamStatus.SHOW,
      },
      select: {
        duration_minute: true,
        open_at: true,
        close_at: true,
        exam_type: true,
        questions: {
          where: { deleted_at: null },
          select: {
            question_id: true,
            score: true,
            choices: {
              where: { deleted_at: null },
              select: {
                choice_id: true,
                choice_detail: true,
                is_correct: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { ok: false, message: "ไม่พบข้อสอบ/ยังไม่เผยแพร่" },
        { status: 404 },
      );
    }

    // ✅ enforce window open/close
    if (exam.open_at && now < exam.open_at) {
      return NextResponse.json(
        { ok: false, message: "ข้อสอบยังไม่เปิด" },
        { status: 403 },
      );
    }
    if (exam.close_at && now > exam.close_at) {
      return NextResponse.json(
        { ok: false, message: "ข้อสอบปิดแล้ว" },
        { status: 403 },
      );
    }

    // ✅ หา attempt ที่กำลังทำอยู่
    const attempt = await prisma.exam_Attempts.findFirst({
      where: {
        exam_id: examIdBig,
        user_id: userId,
        submit_datetime: null,
        deleted_at: null,
      },
      orderBy: { started_at: "desc" },
      select: { attempt_id: true, started_at: true },
    });

    if (!attempt) {
      return NextResponse.json(
        { ok: false, message: "ไม่พบ attempt ที่กำลังทำ" },
        { status: 409 },
      );
    }

    // ✅ deadline = min(started_at+duration, close_at ถ้ามี)
    const perAttemptDeadline = new Date(
      attempt.started_at.getTime() + exam.duration_minute * 60_000,
    );
    const deadline = exam.close_at
      ? new Date(Math.min(perAttemptDeadline.getTime(), exam.close_at.getTime()))
      : perAttemptDeadline;

    if (now.getTime() > deadline.getTime() + GRACE_MS) {
      const expired = pickAttemptStatus(["EXPIRED", "TIME_EXPIRED", "TIMEOUT"]);
      if (expired) {
        await prisma.exam_Attempts.updateMany({
          where: { attempt_id: attempt.attempt_id, submit_datetime: null, deleted_at: null },
          data: { attempt_status: expired },
        });
      }

      return NextResponse.json(
        { ok: false, message: "หมดเวลาทำข้อสอบแล้ว" },
        { status: 409 },
      );
    }

    const examType = (exam.exam_type ?? ExamType.MULTIPLE_CHOICE) as ExamType;

    // ✅ คำนวณคะแนน
    let score = 0;
    let total = 0;

    for (const q of exam.questions ?? []) {
      const qid = q.question_id.toString();
      const qScore = Number(q.score ?? 0);
      total += qScore;

      const ans = String(answers[qid] ?? "").trim();
      if (!ans) continue;

      if (examType === ExamType.MULTIPLE_CHOICE) {
        // ans = choiceId
        const correct = (q.choices ?? []).some(
          (c) => c.is_correct && c.choice_id.toString() === ans,
        );
        if (correct) score += qScore;
      } else {
        // FILL_IN_THE_BLANK: ans = text/code
        const normalized = ans.toLowerCase();
        const correct = (q.choices ?? [])
          .filter((c) => c.is_correct)
          .some((c) => String(c.choice_detail ?? "").trim().toLowerCase() === normalized);

        if (correct) score += qScore;
      }
    }

    const submitted = pickAttemptStatus(["SUBMITTED", "DONE", "FINISHED", "COMPLETED"]);

    // ✅ update แบบ atomic กันส่งซ้ำ
    const updated = await prisma.exam_Attempts.updateMany({
      where: {
        attempt_id: attempt.attempt_id,
        submit_datetime: null,
        deleted_at: null,
      },
      data: {
        total_score: score,
        submit_datetime: now,
        ...(submitted ? { attempt_status: submitted } : {}),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { ok: false, message: "คุณส่งไปแล้ว" },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true, score, total }, { status: 200 });
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (msg === "unauthorized")
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "forbidden")
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    console.error("submit failed:", e);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
