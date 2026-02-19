// app/api/courses/[courseId]/exams/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ExamStatus, ExamType } from "@prisma/client";

const ChoiceSchema = z.object({
  choice_detail: z.string().min(1, "กรุณากรอกตัวเลือก"),
  is_correct: z.boolean(),
});

const QuestionSchema = z.object({
  score: z.number().int().positive("คะแนนต้องมากกว่า 0"),
  question_detail: z.string().min(1, "กรุณากรอกคำถาม"),
  choices: z.array(ChoiceSchema).min(1, "ต้องมีตัวเลือกอย่างน้อย 1 ข้อ"),
});

const CreateExamSchema = z.object({
  exam_title: z.string().min(1, "กรุณากรอกชื่อข้อสอบ"),
  exam_description: z.string().nullable().optional(),
  exam_type: z.nativeEnum(ExamType).optional(), // MULTIPLE_CHOICE | FILL_IN_THE_BLANK
  duration_minute: z.number().int().positive("เวลาสอบต้องมากกว่า 0"),
  exam_status: z.nativeEnum(ExamStatus).optional(), // HIDE | SHOW
  questions: z.array(QuestionSchema).min(1, "ต้องมีอย่างน้อย 1 คำถาม"),
});

function toBigIntOrThrow(v: string, label: string) {
  try {
    if (!/^\d+$/.test(v)) throw new Error("invalid");
    return BigInt(v);
  } catch {
    throw new Error(`${label} ไม่ถูกต้อง`);
  }
}

function getRoleFromSessionUser(u: any): string | null {
  // รองรับหลายชื่อ field เผื่อคุณเก็บไม่เหมือนกัน
  const role = u?.role ?? u?.user_role ?? u?.userRole ?? u?.userRoleName;
  if (!role) return null;
  return String(role).toUpperCase();
}

async function resolveUserIdFromSessionUser(u: any): Promise<bigint | null> {
  if (!u) return null;

  // 1) มี id ตรง ๆ ใน session
  if (u.user_id != null && /^\d+$/.test(String(u.user_id))) return BigInt(u.user_id);
  if (u.id != null && /^\d+$/.test(String(u.id))) return BigInt(u.id);

  // 2) หาใน DB จาก email
  if (u.email) {
    const found = await prisma.user.findUnique({
      where: { email: String(u.email).toLowerCase() },
      select: { user_id: true },
    });
    return found?.user_id ?? null;
  }

  return null;
}

export async function POST(req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  try {
    // ✅ RBAC กันตั้งแต่ต้นทาง
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const u = session.user as any;
    const role = getRoleFromSessionUser(u);

    // ✅ อนุญาตเฉพาะ ADMIN/EXAMINER เท่านั้น (role หายก็ถือว่าไม่อนุญาต)
    if (role !== "ADMIN" && role !== "EXAMINER") {
      return NextResponse.json(
        { message: "Forbidden: คุณไม่มีสิทธิ์สร้างข้อสอบ" },
        { status: 403 },
      );
    }

    const { courseId } = await ctx.params;
    const courseIdBigInt = toBigIntOrThrow(courseId, "courseId");

    const json = await req.json();
    const parsed = CreateExamSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const examType = data.exam_type ?? ExamType.MULTIPLE_CHOICE;

    // ✅ validate ตามประเภทข้อสอบ
    for (const [i, q] of data.questions.entries()) {
      const correctCount = q.choices.filter((c) => c.is_correct).length;

      if (examType === ExamType.MULTIPLE_CHOICE) {
        if (q.choices.length < 2) {
          return NextResponse.json(
            { message: `คำถามข้อที่ ${i + 1} ต้องมีตัวเลือกอย่างน้อย 2 ข้อ` },
            { status: 400 },
          );
        }
        if (correctCount < 1) {
          return NextResponse.json(
            { message: `คำถามข้อที่ ${i + 1} ต้องมีคำตอบที่ถูกอย่างน้อย 1 ข้อ` },
            { status: 400 },
          );
        }
      } else {
        // FILL_IN_THE_BLANK
        if (q.choices.length < 1) {
          return NextResponse.json(
            { message: `คำถามข้อที่ ${i + 1} ต้องมีรหัสคำตอบอย่างน้อย 1 ค่า` },
            { status: 400 },
          );
        }
        if (correctCount < 1) {
          return NextResponse.json(
            { message: `คำถามข้อที่ ${i + 1} ต้องมีรหัสคำตอบที่ถูกอย่างน้อย 1 ค่า` },
            { status: 400 },
          );
        }
      }
    }

    const createdBy = await resolveUserIdFromSessionUser(u);
    if (!createdBy) {
      return NextResponse.json(
        { message: "ไม่พบผู้ใช้ใน session (กรุณาเข้าสู่ระบบใหม่)" },
        { status: 401 },
      );
    }

    const now = new Date();

    const created = await prisma.exams.create({
      data: {
        course: { connect: { course_id: courseIdBigInt } },
        exam_title: data.exam_title,
        exam_description: data.exam_description ?? null,

        exam_type: examType,
        duration_minute: data.duration_minute,
        exam_status: data.exam_status ?? ExamStatus.HIDE,

        created_at: now,
        author: { connect: { user_id: createdBy } },

        questions: {
          create: data.questions.map((q) => ({
            score: q.score,
            question_detail: q.question_detail,
            created_at: now,
            choices: {
              create: q.choices.map((c) => ({
                choice_detail: c.choice_detail,
                is_correct: c.is_correct,
                created_at: now,
              })),
            },
          })),
        },
      },
      select: { exam_id: true },
    });

    return NextResponse.json({ exam_id: created.exam_id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/courses/[courseId]/exams failed:", err);
    return NextResponse.json({ message: err?.message ?? "Server error" }, { status: 500 });
  }
}
