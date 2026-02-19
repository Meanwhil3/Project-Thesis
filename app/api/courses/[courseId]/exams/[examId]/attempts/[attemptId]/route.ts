// app/api/courses/[courseId]/exams/[examId]/attempts/[attemptId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ExamStatus, ExamType } from "@prisma/client";

function toBigIntOrThrow(v: string, label: string) {
  if (!/^\d+$/.test(v)) throw new Error(`${label} ไม่ถูกต้อง`);
  return BigInt(v);
}

type AppRole = "ADMIN" | "INSTRUCTOR" | "TRAINEE";
function normalizeRole(v: unknown): AppRole | null {
  const s = String(v ?? "").toUpperCase();
  if (s === "ADMIN" || s === "INSTRUCTOR" || s === "TRAINEE") return s;
  return null;
}

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  const role = normalizeRole(u?.role);

  let userId: bigint | null = null;
  if (u?.user_id != null && /^\d+$/.test(String(u.user_id))) userId = BigInt(u.user_id);
  else if (u?.id != null && /^\d+$/.test(String(u.id))) userId = BigInt(u.id);
  else if (u?.email) {
    const found = await prisma.user.findUnique({
      where: { email: String(u.email).toLowerCase() },
      select: { user_id: true },
    });
    userId = found?.user_id ?? null;
  }

  return { role, userId };
}

function normalizeFill(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "");
}

const SubmitSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().regex(/^\d+$/),
        choice_id: z.string().regex(/^\d+$/).optional(),
        text: z.string().optional(),
      })
    )
    .min(1, "ต้องส่งคำตอบอย่างน้อย 1 ข้อ"),
});

export async function PATCH(
  req: Request,
  ctx: { params: { courseId: string; examId: string; attemptId: string } }
) {
  try {
    const { role, userId } = await getSessionUser();
    if (!role || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const courseId = toBigIntOrThrow(ctx.params.courseId, "courseId");
    const examId = toBigIntOrThrow(ctx.params.examId, "examId");
    const attemptId = toBigIntOrThrow(ctx.params.attemptId, "attemptId");

    const body = await req.json().catch(() => ({}));
    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // ✅ โหลด attempt + เช็คว่า attempt นี้อยู่ใน exam นี้จริง
    const attempt = await prisma.exam_Attempts.findFirst({
      where: { attempt_id: attemptId, deleted_at: null },
      select: { attempt_id: true, user_id: true, exam_id: true },
    });

    if (!attempt || attempt.exam_id == null || attempt.exam_id !== examId) {
      return NextResponse.json({ message: "ไม่พบ attempt" }, { status: 404 });
    }

    // ✅ trainee ส่งได้เฉพาะ attempt ของตัวเอง
    if (role === "TRAINEE") {
      if (attempt.user_id == null || attempt.user_id !== userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    // ✅ โหลดข้อสอบ + เฉลยจาก DB เพื่อให้คะแนน
    const exam = await prisma.exams.findFirst({
      where: {
        exam_id: examId,
        course_id: courseId,
        deleted_at: null,
      },
      select: {
        exam_type: true,
        exam_status: true,
        questions: {
          where: { deleted_at: null },
          select: {
            question_id: true,
            score: true,
            choices: {
              where: { deleted_at: null },
              select: { choice_id: true, choice_detail: true, is_correct: true },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ message: "ไม่พบข้อสอบ" }, { status: 404 });
    }

    // ✅ trainee ทำได้เฉพาะ SHOW
    if (role === "TRAINEE" && (exam.exam_status ?? ExamStatus.HIDE) !== ExamStatus.SHOW) {
      return NextResponse.json({ message: "ข้อสอบนี้ยังไม่เปิดให้ทำ" }, { status: 403 });
    }

    const type = exam.exam_type ?? ExamType.MULTIPLE_CHOICE;

    // ✅ สร้าง map ของ answers จาก client: question_id -> answer
    const ansMap = new Map(parsed.data.answers.map((a) => [a.question_id, a]));

    // ✅ ให้คะแนน
    let total = 0;

    for (const q of exam.questions) {
      const qid = q.question_id.toString();
      const a = ansMap.get(qid);

      // ถ้าไม่ตอบข้อนี้ -> 0 คะแนน
      if (!a) continue;

      if (type === ExamType.MULTIPLE_CHOICE) {
        // ต้องส่ง choice_id
        const selected = a.choice_id ? BigInt(a.choice_id) : null;
        if (!selected) continue;

        const selectedRow = q.choices.find((c) => c.choice_id === selected);
        if (selectedRow?.is_correct) total += q.score;
      } else {
        // FILL_IN_THE_BLANK: ต้องส่ง text
        const input = normalizeFill(a.text ?? "");
        if (!input) continue;

        const accepted = new Set(
          q.choices
            .filter((c) => c.is_correct)
            .map((c) => normalizeFill(c.choice_detail))
        );

        if (accepted.has(input)) total += q.score;
      }
    }

    const now = new Date();

    // ✅ อัปเดตคะแนนรวม + เวลาส่ง
    const updated = await prisma.exam_Attempts.update({
      where: { attempt_id: attemptId },
      data: {
        total_score: total,
        submit_datetime: now,
      },
      select: { attempt_id: true, total_score: true, submit_datetime: true },
    });

    return NextResponse.json(
      {
        attempt_id: updated.attempt_id.toString(),
        total_score: updated.total_score,
        submit_datetime: updated.submit_datetime.toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
