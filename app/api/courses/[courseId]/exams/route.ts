// app/api/courses/[courseId]/exams/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toBigIntOrNull(v: string): bigint | null {
  try {
    return BigInt(v);
  } catch {
    return null;
  }
}

type Incoming =
  | {
      type: "wood_fill";
      title: string;
      description?: string | null;
      durationMinutes: number;
      status: any; // ExamStatus enum ใน schema คุณ
      questions: Array<{
        order: number;
        score: number;
        woodName: string;
        answerCodes: string[];
      }>;
    }
  | {
      type: "mcq";
      title: string;
      description?: string | null;
      durationMinutes: number;
      status: any; // ExamStatus enum ใน schema คุณ
      questions: Array<{
        order: number;
        score: number;
        prompt: string;
        options: Array<{ order: number; text: string; isCorrect: boolean }>;
      }>;
    };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await ctx.params;
    const course_id = toBigIntOrNull(courseId);
    if (!course_id) {
      return NextResponse.json({ message: "courseId ไม่ถูกต้อง" }, { status: 400 });
    }

    const body = (await req.json()) as Incoming;

    const exam_title = String((body as any)?.title ?? "").trim();
    if (!exam_title) {
      return NextResponse.json({ message: "กรุณากรอกชื่อการสอบ" }, { status: 400 });
    }

    const duration_minute = Number((body as any)?.durationMinutes ?? 0);
    if (!Number.isFinite(duration_minute) || duration_minute <= 0) {
      return NextResponse.json({ message: "เวลาในการสอบไม่ถูกต้อง" }, { status: 400 });
    }

    const exam_type = (body as any)?.type; // ต้องตรงกับ enum ExamType ใน schema
    const exam_status = (body as any)?.status; // ต้องตรงกับ enum ExamStatus ใน schema

    const questions = Array.isArray((body as any)?.questions) ? (body as any).questions : [];
    if (questions.length === 0) {
      return NextResponse.json({ message: "ต้องมีอย่างน้อย 1 ข้อ" }, { status: 400 });
    }

    const now = new Date();

    const created = await prisma.$transaction(async (tx) => {
      const exam = await tx.exams.create({
        data: {
          course_id,
          exam_title,
          exam_description: (body as any)?.description ?? null,
          exam_type,      // ✅ enum ExamType?
          duration_minute,
          exam_status,    // ✅ enum ExamStatus?
          created_at: now,
          created_by: null, // TODO: ผูก session ทีหลัง
          deleted_at: null,
          questions: {
            create:
              exam_type === "wood_fill"
                ? questions.map((q: any) => {
                    const woodName = String(q?.woodName ?? "").trim();
                    const score = Number(q?.score ?? 0);
                    const codes = Array.isArray(q?.answerCodes) ? q.answerCodes : [];
                    const answerCodes = codes.map((x: any) => String(x).trim()).filter(Boolean);

                    if (!woodName) throw new Error("มีข้อสอบที่ยังไม่กรอกชื่อพันธุ์ไม้");
                    if (!Number.isFinite(score) || score <= 0) throw new Error("คะแนนไม่ถูกต้อง");
                    if (answerCodes.length === 0) throw new Error("รหัสคำตอบต้องมีอย่างน้อย 1 ค่า");

                    return {
                      score,
                      question_detail: woodName, // ✅ เก็บชื่อพันธุ์ไม้ลง question_detail
                      created_at: now,
                      deleted_at: null,
                      choices: {
                        // ✅ ใช้ Choices เป็น “คำตอบที่ยอมรับได้”
                        create: answerCodes.map((code: string) => ({
                          choice_detail: code,
                          is_correct: true,
                          created_at: now,
                          deleted_at: null,
                        })),
                      },
                    };
                  })
                : questions.map((q: any) => {
                    const prompt = String(q?.prompt ?? "").trim();
                    const score = Number(q?.score ?? 0);
                    const opts = Array.isArray(q?.options) ? q.options : [];

                    if (!prompt) throw new Error("มีข้อสอบที่ยังไม่กรอกคำถาม");
                    if (!Number.isFinite(score) || score <= 0) throw new Error("คะแนนไม่ถูกต้อง");
                    if (opts.length < 2) throw new Error("MCQ ต้องมีตัวเลือกอย่างน้อย 2 ตัว");
                    if (!opts.some((o: any) => Boolean(o?.isCorrect)))
                      throw new Error("MCQ ต้องมีคำตอบที่ถูกต้องอย่างน้อย 1 ตัวเลือก");

                    return {
                      score,
                      question_detail: prompt, // ✅ เก็บคำถามลง question_detail
                      created_at: now,
                      deleted_at: null,
                      choices: {
                        create: opts.map((o: any) => ({
                          choice_detail: String(o?.text ?? "").trim(),
                          is_correct: Boolean(o?.isCorrect),
                          created_at: now,
                          deleted_at: null,
                        })),
                      },
                    };
                  }),
          },
        },
        select: { exam_id: true },
      });

      return exam;
    });

    return NextResponse.json(
      { ok: true, examId: created.exam_id.toString() },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
