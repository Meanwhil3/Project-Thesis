// app/(course)/courses/[courseId]/members/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@prisma/client";
import MembersClient, { type MemberModel } from "@/components/Courses/MembersClient";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  if (!/^\d+$/.test(courseId)) {
    return <div className="p-6 font-kanit text-red-600">courseId ไม่ถูกต้อง</div>;
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return <div className="p-6 font-kanit text-red-600">กรุณาเข้าสู่ระบบ</div>;
  }

  const role = String((session.user as any)?.role ?? "").toUpperCase();
  if (role !== "ADMIN" && role !== "EXAMINER") {
    return <div className="p-6 font-kanit text-red-600">ไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  const courseIdBig = BigInt(courseId);

  // ── 1. ดึง exams ทั้งหมดของคอร์สนี้ เพื่อคำนวณ maxScore ──────────────────────
  const exams = await prisma.exams.findMany({
    where: { course_id: courseIdBig, deleted_at: null },
    select: {
      exam_id: true,
      questions: {
        where: { deleted_at: null },
        select: { score: true },
      },
    },
  });

  const examIds = exams.map((e) => e.exam_id);
  const maxScore = exams.reduce(
    (sum, e) => sum + e.questions.reduce((s, q) => s + q.score, 0),
    0,
  );

  // ── 2. ดึง enrollments พร้อมข้อมูลผู้ใช้ ────────────────────────────────────
  const enrollments = await prisma.courseEnrollments.findMany({
    where: { course_id: courseIdBig, deleted_at: null },
    orderBy: { enrollment_date: "desc" },
    select: {
      enrollment_id: true,
      enrollment_date: true,
      user: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });

  // ── 3. ดึง attempts ที่ COMPLETED ────────────────────────────────────────────
  const userIds = enrollments
    .map((e) => e.user?.user_id)
    .filter((id): id is bigint => id != null);

  const attempts =
    examIds.length > 0 && userIds.length > 0
      ? await prisma.exam_Attempts.findMany({
          where: {
            exam_id: { in: examIds },
            user_id: { in: userIds },
            attempt_status: AttemptStatus.COMPLETED,
            deleted_at: null,
          },
          select: { user_id: true, exam_id: true, total_score: true },
        })
      : [];

  // ── 4. คำนวณคะแนนรวมต่อคน (best attempt per exam, sum across exams) ─────────
  const bestPerUserExam = new Map<string, number>();
  for (const a of attempts) {
    const key = `${a.user_id}-${a.exam_id}`;
    bestPerUserExam.set(key, Math.max(bestPerUserExam.get(key) ?? 0, a.total_score));
  }

  const totalScoreByUser = new Map<string, number>();
  for (const [key, score] of bestPerUserExam) {
    const userId = key.split("-")[0];
    totalScoreByUser.set(userId, (totalScoreByUser.get(userId) ?? 0) + score);
  }

  // ── 5. สร้าง MemberModel list ───────────────────────────────────────────────
  const members: MemberModel[] = enrollments
    .filter((e) => e.user != null)
    .map((e) => ({
      id: e.user!.user_id.toString(),
      enrollmentId: e.enrollment_id.toString(),
      name: `${e.user!.first_name} ${e.user!.last_name}`,
      email: e.user!.email,
      score: totalScoreByUser.get(e.user!.user_id.toString()) ?? 0,
      maxScore,
    }));

  return <MembersClient courseId={courseId} initialMembers={members} />;
}
