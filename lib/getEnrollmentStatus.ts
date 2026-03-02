// lib/getEnrollmentStatus.ts
// Server-side helper — ใช้ใน page.tsx ของบทเรียนและข้อสอบ
// คืน: "enrolled" | "not_enrolled" | "unauthenticated"

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export type EnrollmentStatus = "enrolled" | "not_enrolled" | "unauthenticated";

export async function getEnrollmentStatus(
  courseIdBig: bigint,
): Promise<{ status: EnrollmentStatus; userId: bigint | null }> {
  const session = await getServerSession(authOptions);
  if (!session) return { status: "unauthenticated", userId: null };

  const u = session.user as any;
  const role = String(u?.role ?? "").toUpperCase();

  // Admin / Instructor ถือว่า "enrolled" เสมอ (เข้าได้ทุกคอร์ส)
  if (role === "ADMIN" || role === "INSTRUCTOR") {
    return { status: "enrolled", userId: null };
  }

  // ─── Resolve userId ──────────────────────────────────────────────────────
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

  if (!userId) return { status: "unauthenticated", userId: null };

  const enrollment = await prisma.courseEnrollments.findFirst({
    where: { user_id: userId, course_id: courseIdBig, deleted_at: null },
    select: { enrollment_id: true },
  });

  return {
    status: enrollment ? "enrolled" : "not_enrolled",
    userId,
  };
}