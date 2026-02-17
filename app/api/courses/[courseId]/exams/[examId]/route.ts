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

async function getCreatedByUserId(): Promise<bigint | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  if (!u) return null;

  if (u.user_id != null && /^\d+$/.test(String(u.user_id))) return BigInt(u.user_id);
  if (u.id != null && /^\d+$/.test(String(u.id))) return BigInt(u.id);

  if (u.email) {
    const found = await prisma.user.findUnique({
      where: { email: String(u.email).toLowerCase() },
      select: { user_id: true },
    });
    return found?.user_id ?? null;
  }
  return null;
}

const ChoiceSchema = z.object({
  choice_detail: z.string().min(1, "กรุณากรอกตัวเลือก/รหัสคำตอบ"),
  is_correct: z.boolean(),
});

const QuestionSchema = z.object({
  score: z.number().int().positive("คะแนนต้องมากกว่า 0"),
  question_detail: z.string().min(1, "กรุณากรอกคำถาม"),
  // ✅ รองรับ FILL_IN_THE_BLANK ได้ (อย่างน้อย 1 คำตอบ)
  choices: z.array(ChoiceSchema).min(1, "ต้องมีคำตอบอย่างน้อย 1 ค่า"),
});

const UpdateExamSchema = z.object({
  exam_title: z.string().min(1, "กรุณากรอกชื่อข้อสอบ"),
  exam_description: z.string().nullable().optional(),
  exam_type: z.nativeEnum(ExamType), // บังคับส่งมา (กันสลับชนิดมั่ว)
  duration_minute: z.number().int().positive("เวลาสอบต้องมากกว่า 0"),
  exam_status: z.nativeEnum(ExamStatus),
  questions: z.array(QuestionSchema).min(1, "ต้องมีอย่างน้อย 1 คำถาม"),
});

export async function GET(
  _req: Request,
  ctx: { params: { courseId: string; examId: string } }
) {
  try {
    const { courseId, examId } = ctx.params;
    const courseIdBigInt = toBigIntOrThrow(courseId, "courseId");
    const examIdBigInt = toBigIntOrThrow(examId, "examId");

    const exam = await prisma.exams.findFirst({
      where: {
        exam_id: examIdBigInt,
        course_id: courseIdBigInt,
        deleted_at: null,
      },
      select: {
        exam_id: true,
        course_id: true,
        exam_title: true,
        exam_description: true,
        exam_type: true,
        duration_minute: true,
        exam_status: true,
        created_at: true,
        created_by: true,
        author: { select: { first_name: true } },
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

    // BigInt → string สำหรับส่ง JSON
    return NextResponse.json(
      {
        exam: {
          ...exam,
          exam_id: exam.exam_id.toString(),
          course_id: exam.course_id?.toString?.() ?? null,
          created_by: exam.created_by?.toString?.() ?? null,
          created_at: exam.created_at.toISOString(),
          questions: exam.questions.map((q) => ({
            ...q,
            question_id: q.question_id.toString(),
            choices: q.choices.map((c) => ({
              ...c,
              choice_id: c.choice_id.toString(),
            })),
          })),
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: { courseId: string; examId: string } }
) {
  try {
    const { courseId, examId } = ctx.params;
    const courseIdBigInt = toBigIntOrThrow(courseId, "courseId");
    const examIdBigInt = toBigIntOrThrow(examId, "examId");

    const json = await req.json();
    const parsed = UpdateExamSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // ✅ ต้องล็อกอิน
    const editorId = await getCreatedByUserId();
    if (!editorId) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนแก้ไข" },
        { status: 401 }
      );
    }

    // ✅ เช็คข้อสอบอยู่ในคอร์สนี้จริง
    const existing = await prisma.exams.findFirst({
      where: {
        exam_id: examIdBigInt,
        course_id: courseIdBigInt,
        deleted_at: null,
      },
      select: { exam_id: true, exam_type: true },
    });
    if (!existing) {
      return NextResponse.json({ message: "ไม่พบข้อสอบ" }, { status: 404 });
    }

    // ✅ กันสลับชนิดข้อสอบผิดประเภท
    if (existing.exam_type && existing.exam_type !== data.exam_type) {
      return NextResponse.json(
        { message: "ชนิดข้อสอบไม่ตรงกับของเดิม" },
        { status: 400 }
      );
    }

    // ✅ validate ตามชนิด
    for (const [i, q] of data.questions.entries()) {
      const correctCount = q.choices.filter((c) => c.is_correct).length;

      if (data.exam_type === ExamType.MULTIPLE_CHOICE) {
        if (q.choices.length < 2) {
          return NextResponse.json(
            { message: `ข้อที่ ${i + 1}: ต้องมีตัวเลือกอย่างน้อย 2 ข้อ` },
            { status: 400 }
          );
        }
        if (correctCount < 1) {
          return NextResponse.json(
            { message: `ข้อที่ ${i + 1}: ต้องมีคำตอบถูกอย่างน้อย 1 ข้อ` },
            { status: 400 }
          );
        }
      } else {
        // FILL_IN_THE_BLANK
        if (q.choices.length < 1) {
          return NextResponse.json(
            { message: `ข้อที่ ${i + 1}: ต้องมีรหัสคำตอบอย่างน้อย 1 ค่า` },
            { status: 400 }
          );
        }
        if (correctCount < 1) {
          return NextResponse.json(
            { message: `ข้อที่ ${i + 1}: ต้องมีรหัสคำตอบที่ถูกอย่างน้อย 1 ค่า` },
            { status: 400 }
          );
        }
      }
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const qIds = await tx.questions.findMany({
        where: { exam_id: examIdBigInt },
        select: { question_id: true },
      });

      const ids = qIds.map((x) => x.question_id);
      if (ids.length) {
        await tx.choices.deleteMany({ where: { question_id: { in: ids } } });
      }
      await tx.questions.deleteMany({ where: { exam_id: examIdBigInt } });

      const result = await tx.exams.update({
        where: { exam_id: examIdBigInt },
        data: {
          exam_title: data.exam_title,
          exam_description: data.exam_description ?? null,
          exam_type: data.exam_type,
          duration_minute: data.duration_minute,
          exam_status: data.exam_status,
          // ไม่แตะ created_at / created_by
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

      return result;
    });

    return NextResponse.json(
      { exam_id: updated.exam_id.toString() },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? "Server error" }, { status: 500 });
  }
}
