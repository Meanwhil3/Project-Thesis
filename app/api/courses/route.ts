// app/api/courses/route.ts
// คืนคอร์สทั้งหมดที่เปิดอยู่ พร้อม enrolled: true/false สำหรับ TRAINEE
// TRAINEE เห็นทุกคอร์ส แต่ enrolled บอกว่าลงทะเบียนหรือยัง

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const u = session.user as any;
  const role = String(u?.role ?? "").toUpperCase();

  if (role !== "TRAINEE") {
    return NextResponse.json({ message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
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
    return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 401 });
  }

  // ─── ตรวจสอบว่าผู้ใช้ถูกบล็อกหรือไม่ ─────────────────────────────────────
  const dbUser = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { is_active: true },
  });
  if (dbUser && !dbUser.is_active) {
    return NextResponse.json({ message: "บัญชีของคุณถูกระงับการใช้งาน" }, { status: 403 });
  }

  // ─── ดึงคอร์สทั้งหมดที่เปิดอยู่ ──────────────────────────────────────────
  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { deleted_at: null, course_status: CourseStatus.OPEN },
      select: {
        course_id: true,
        course_name: true,
        course_description: true,
        image_url: true,
        location: true,
        course_status: true,
        start_date: true,
        end_date: true,
      },
      orderBy: { course_id: "desc" },
    }),
    // ดึง enrollment ของ user นี้ทั้งหมดในครั้งเดียว
    prisma.courseEnrollments.findMany({
      where: { user_id: userId, deleted_at: null },
      select: { course_id: true },
    }),
  ]);

  // นับจำนวน enrollment ต่อคอร์ส
  const enrollmentCounts = await prisma.courseEnrollments.groupBy({
    by: ["course_id"],
    where: {
      deleted_at: null,
      course_id: { in: courses.map((c) => c.course_id) },
    },
    _count: { enrollment_id: true },
  });
  const countMap = new Map(
    enrollmentCounts.map((e) => [e.course_id?.toString() ?? "", e._count.enrollment_id]),
  );

  const enrolledSet = new Set(enrollments.map((e) => e.course_id?.toString()));

  const formatDate = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("th-TH", {
          timeZone: "Asia/Bangkok",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(d)
      : "";

  const result = courses.map((c) => ({
    id: c.course_id.toString(),
    title: c.course_name,
    subtitle: c.course_description ?? "",
    imageUrl: c.image_url ?? "",
    location: c.location ?? "",
    status: c.course_status === CourseStatus.OPEN ? "open" : "closed",
    startDate: formatDate(c.start_date),
    endDate: formatDate(c.end_date),
    enrolledCount: countMap.get(c.course_id.toString()) ?? 0,
    enrolled: enrolledSet.has(c.course_id.toString()),
  }));

  return NextResponse.json(result);
}