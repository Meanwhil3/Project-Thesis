// app/courses/[courseId]/exams/server-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export type JoinExamState = {
  ok: boolean;
  message?: string;
};

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase();
}

export async function joinExamByCode(
  courseId: string,
  _prev: JoinExamState,
  formData: FormData
): Promise<JoinExamState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, message: "กรุณาเข้าสู่ระบบก่อน" };

  const role = (session.user as any)?.role as string | undefined;
  if (role !== "TRAINEE") return { ok: false, message: "เฉพาะผู้เข้าสอบ (TRAINEE) เท่านั้น" };

  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, message: "รหัสเข้าสอบต้องเป็นตัวเลข 6 หลัก" };
  }

  const exam = await prisma.exams.findFirst({
    where: {
      course_id: BigInt(courseId),
      examAccessCode: code,
      exam_status: "SHOW" as any,
      deleted_at: null,
    },
    select: { exam_id: true },
  });

  if (!exam) {
    return { ok: false, message: "ไม่พบรหัสข้อสอบ หรือข้อสอบยังไม่ถูกเผยแพร่" };
  }

  // ✅ เวอร์ชันนี้ redirect ไปหน้า take ตรง ๆ
  // แนะนำ: ใน take/page.tsx ค่อย “สร้าง attempt” แบบปลอดภัย (ผมทำให้ได้ต่อ)
  redirect(`/courses/${courseId}/exams/${exam.exam_id.toString()}/take`);
}
