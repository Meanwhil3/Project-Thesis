// app/api/courses/[courseId]/members/[enrollmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function toBigInt(v: string | undefined): bigint | null {
  if (!v || !/^\d+$/.test(v)) return null;
  return BigInt(v);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ courseId: string; enrollmentId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const role = String((session.user as any)?.role ?? "").toUpperCase();
  if (role !== "ADMIN" && role !== "EXAMINER") {
    return NextResponse.json({ ok: false, message: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  }

  const { courseId, enrollmentId } = await ctx.params;
  const courseIdBig = toBigInt(courseId);
  const enrollmentIdBig = toBigInt(enrollmentId);
  if (!courseIdBig || !enrollmentIdBig) {
    return NextResponse.json({ ok: false, message: "พารามิเตอร์ไม่ถูกต้อง" }, { status: 400 });
  }

  const enrollment = await prisma.courseEnrollments.findFirst({
    where: {
      enrollment_id: enrollmentIdBig,
      course_id: courseIdBig,
      deleted_at: null,
    },
    select: { enrollment_id: true },
  });

  if (!enrollment) {
    return NextResponse.json({ ok: false, message: "ไม่พบสมาชิก" }, { status: 404 });
  }

  await prisma.courseEnrollments.update({
    where: { enrollment_id: enrollmentIdBig },
    data: { deleted_at: new Date() },
  });

  return NextResponse.json({ ok: true });
}
