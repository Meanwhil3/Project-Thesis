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

  // รองรับ user_id / id / email fallback
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

const StartAttemptSchema = z.object({
  accessCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "รหัสต้องเป็นตัวเลข 6 หลัก")
    .optional(),
});

export async function POST(
  req: Request,
  ctx: { params: { courseId: string; examId: string } }
) {
  try {
    const { role, userId } = await getSessionUser();
    if (!role || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const courseId = toBigIntOrThrow(ctx.params.courseId, "courseId");
    const examId = toBigIntOrThrow(ctx.params.examId, "examId");

    const body = await req.json().catch(() => ({}));
    const parsed = StartAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const exam = await prisma.exams.findFirst({
      where: { exam_id: examId, course_id: courseId, deleted_at: null },
      select: {
        exam_id: true,
        exam_title: true,
        exam_description: true,
        exam_type: true,
        duration_minute: true,
        exam_status: true,
        examAccessCode: true,
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
      return NextResponse.json({ message: "ไม่พบข้อสอบ" }, { status: 404 });
    }

    // ✅ trainee: ต้องเป็น SHOW เท่านั้น
    if (role === "TRAINEE" && (exam.exam_status ?? ExamStatus.HIDE) !== ExamStatus.SHOW) {
      return NextResponse.json({ message: "ข้อสอบนี้ยังไม่เปิดให้ทำ" }, { status: 403 });
    }

    // ✅ trainee: ต้องกรอกรหัส และต้องตรงกับ DB
    if (role === "TRAINEE") {
      if (!exam.examAccessCode) {
        return NextResponse.json(
          { message: "ข้อสอบนี้ยังไม่ได้ตั้งรหัสเข้าสอบ" },
          { status: 400 }
        );
      }
      const inputCode = parsed.data.accessCode ?? "";
      if (inputCode !== exam.examAccessCode) {
        return NextResponse.json({ message: "รหัสเข้าสอบไม่ถูกต้อง" }, { status: 400 });
      }

      // (ทางเลือก) เช็คว่า enroll อยู่ในคอร์สจริงไหม
      const enrolled = await prisma.courseEnrollments.findFirst({
        where: { course_id: courseId, user_id: userId, deleted_at: null },
        select: { enrollment_id: true },
      });
      if (!enrolled) {
        return NextResponse.json({ message: "คุณยังไม่ได้ลงทะเบียนคอร์สนี้" }, { status: 403 });
      }
    }

    const now = new Date();

    // ✅ สร้าง attempt (ตอนนี้ schema คุณบังคับ submit_datetime → ใส่ now ไปก่อน)
    const attempt = await prisma.exam_Attempts.create({
      data: {
        user: { connect: { user_id: userId } },
        exam: { connect: { exam_id: examId } },
        total_score: 0,
        submit_datetime: now,
        created_at: now,
      },
      select: { attempt_id: true },
    });

    const type = exam.exam_type ?? ExamType.MULTIPLE_CHOICE;

    // ✅ ส่ง “โจทย์แบบไม่เฉลย”
    // - MCQ: ส่ง choices ได้ แต่ห้ามส่ง is_correct
    // - Fill: อย่าส่งรหัสคำตอบที่ถูก (choices) เพราะเป็นเฉลย → ส่งเป็น [] แทน
    const safeExam = {
      exam_id: exam.exam_id.toString(),
      exam_title: exam.exam_title,
      exam_description: exam.exam_description ?? "",
      exam_type: type,
      duration_minute: exam.duration_minute,
      questions: exam.questions.map((q) => ({
        question_id: q.question_id.toString(),
        score: q.score,
        question_detail: q.question_detail,
        choices:
          type === ExamType.MULTIPLE_CHOICE
            ? q.choices.map((c) => ({
                choice_id: c.choice_id.toString(),
                choice_detail: c.choice_detail,
              }))
            : [],
      })),
    };

    return NextResponse.json(
      { attempt_id: attempt.attempt_id.toString(), exam: safeExam },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? "Server error" }, { status: 500 });
  }
}
