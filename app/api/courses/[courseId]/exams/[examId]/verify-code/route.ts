import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ courseId: string; examId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { courseId, examId } = await ctx.params;
    if (!/^\d+$/.test(courseId) || !/^\d+$/.test(examId)) {
      return NextResponse.json({ message: "Invalid params" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const inputCode = String(body.accessCode ?? "").trim();

    if (!/^\d{6}$/.test(inputCode)) {
      return NextResponse.json(
        { message: "รหัสเข้าสอบต้องเป็นตัวเลข 6 หลัก" },
        { status: 400 }
      );
    }

    const exam = await prisma.exams.findFirst({
      where: {
        exam_id: BigInt(examId),
        course_id: BigInt(courseId),
        deleted_at: null,
      },
      select: { examAccessCode: true },
    });

    if (!exam || !exam.examAccessCode) {
      return NextResponse.json(
        { message: "ไม่พบข้อสอบ" },
        { status: 404 }
      );
    }

    if (inputCode !== exam.examAccessCode) {
      return NextResponse.json(
        { message: "รหัสเข้าสอบไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Set a cookie to remember the verified access code for this exam
    const cookieStore = await cookies();
    cookieStore.set(`exam_code_${examId}`, inputCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 4, // 4 hours
      path: `/`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
