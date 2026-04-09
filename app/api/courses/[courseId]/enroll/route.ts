// app/api/courses/[courseId]/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";

function toBigInt(v: string | undefined): bigint | null {
  if (!v || !/^\d+$/.test(v)) return null;
  return BigInt(v);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } },
) {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const u = session.user as any;
  const role = String(u?.role ?? "").toUpperCase();

  // เฉพาะ TRAINEE เท่านั้นที่ enroll ได้
  if (role !== "TRAINEE") {
    return NextResponse.json(
      { ok: false, message: "เฉพาะ TRAINEE เท่านั้นที่สามารถลงทะเบียนได้" },
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
      select: { user_id: true },
    });
    userId = found?.user_id ?? null;
  }
  if (!userId) {
    return NextResponse.json({ ok: false, message: "ไม่พบผู้ใช้" }, { status: 401 });
  }

  // ─── ตรวจสอบว่าผู้ใช้ถูกบล็อกหรือไม่ ─────────────────────────────────────
  const dbUser = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { is_active: true },
  });
  if (dbUser && !dbUser.is_active) {
    return NextResponse.json({ ok: false, message: "บัญชีถูกระงับการใช้งาน" }, { status: 403 });
  }

  // ─── Parse params & body ───────────────────────────────────────────────────
  const courseIdBig = toBigInt(params.courseId);
  if (!courseIdBig) {
    return NextResponse.json({ ok: false, message: "courseId ไม่ถูกต้อง" }, { status: 400 });
  }

  let enrollCode: string = "";
  try {
    const body = await req.json();
    enrollCode = String(body?.enroll_code ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, message: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  if (!enrollCode) {
    return NextResponse.json({ ok: false, message: "กรุณากรอกรหัสลงทะเบียน" }, { status: 400 });
  }

  // ─── ตรวจว่าคอร์สมีอยู่และเปิดอยู่ ────────────────────────────────────────
  const course = await prisma.course.findFirst({
    where: {
      course_id: courseIdBig,
      deleted_at: null,
      course_status: CourseStatus.OPEN,
    },
    select: { course_id: true, course_name: true, enroll_code: true },
  });

  if (!course) {
    return NextResponse.json({ ok: false, message: "ไม่พบคอร์ส หรือคอร์สปิดอยู่" }, { status: 404 });
  }

  // ─── ตรวจ enroll_code ──────────────────────────────────────────────────────
  if (!course.enroll_code || course.enroll_code.trim() !== enrollCode) {
    return NextResponse.json({ ok: false, message: "รหัสลงทะเบียนไม่ถูกต้อง" }, { status: 400 });
  }

  // ─── ตรวจว่า enroll ไปแล้วหรือยัง ─────────────────────────────────────────
  const existing = await prisma.courseEnrollments.findFirst({
    where: {
      user_id: userId,
      course_id: courseIdBig,
      deleted_at: null,
    },
    select: { enrollment_id: true },
  });

  if (existing) {
    return NextResponse.json(
      { ok: false, message: "คุณลงทะเบียนในคอร์สนี้ไปแล้ว" },
      { status: 409 },
    );
  }

  // ─── สร้าง enrollment ──────────────────────────────────────────────────────
  await prisma.courseEnrollments.create({
    data: {
      user_id: userId,
      course_id: courseIdBig,
      enrollment_date: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    message: `ลงทะเบียนเข้าคอร์ส "${course.course_name}" สำเร็จ`,
  });
}