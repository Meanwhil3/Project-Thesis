// app/(course)/courses/[courseId]/scores/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@prisma/client";
import TraineeScoresClient from "@/components/Courses/TraineeScoresClient";

export const dynamic = "force-dynamic";

export default async function ScoresPage({
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
  if (role !== "TRAINEE") {
    return <div className="p-6 font-kanit text-red-600">หน้านี้สำหรับผู้เรียนเท่านั้น</div>;
  }

  const rawUserId = (session.user as any)?.id || (session.user as any)?.user_id || (session.user as any)?.sub;
  if (!rawUserId) {
    return <div className="p-6 font-kanit text-red-600">ไม่พบข้อมูลผู้ใช้</div>;
  }

  const userId = BigInt(rawUserId);
  const courseIdBig = BigInt(courseId);

  // ── 1. ดึง exams ทั้งหมดของคอร์สนี้ พร้อม maxScore ─────
  const exams = await prisma.exams.findMany({
    where: { course_id: courseIdBig, deleted_at: null, exam_status: "SHOW" },
    orderBy: { created_at: "asc" },
    select: {
      exam_id: true,
      exam_title: true,
      questions: {
        where: { deleted_at: null },
        select: { score: true },
      },
    },
  });

  const examIds = exams.map((e) => e.exam_id);

  // ── 2. ดึง attempts ที่ COMPLETED ของ user นี้ ─────
  const attempts =
    examIds.length > 0
      ? await prisma.exam_Attempts.findMany({
          where: {
            exam_id: { in: examIds },
            user_id: userId,
            attempt_status: AttemptStatus.COMPLETED,
            deleted_at: null,
          },
          select: {
            exam_id: true,
            total_score: true,
            submit_datetime: true,
          },
          orderBy: { submit_datetime: "desc" },
        })
      : [];

  // ── 3. คำนวณ best score per exam ─────
  const bestPerExam = new Map<string, number>();
  const attemptCountPerExam = new Map<string, number>();
  const lastAttemptDate = new Map<string, Date | null>();

  for (const a of attempts) {
    const eid = a.exam_id.toString();
    bestPerExam.set(eid, Math.max(bestPerExam.get(eid) ?? 0, a.total_score));
    attemptCountPerExam.set(eid, (attemptCountPerExam.get(eid) ?? 0) + 1);
    if (!lastAttemptDate.has(eid) && a.submit_datetime) {
      lastAttemptDate.set(eid, a.submit_datetime);
    }
  }

  // ── 4. สร้างข้อมูลสำหรับ client ─────
  const examScores = exams.map((e) => {
    const eid = e.exam_id.toString();
    const maxScore = e.questions.reduce((s, q) => s + q.score, 0);
    const score = bestPerExam.get(eid) ?? null;
    return {
      examId: eid,
      examTitle: e.exam_title,
      score,
      maxScore,
      attempts: attemptCountPerExam.get(eid) ?? 0,
      lastAttemptDate: lastAttemptDate.get(eid)?.toISOString() ?? null,
    };
  });

  const totalScore = examScores.reduce((s, e) => s + (e.score ?? 0), 0);
  const totalMaxScore = examScores.reduce((s, e) => s + e.maxScore, 0);

  return (
    <TraineeScoresClient
      examScores={examScores}
      totalScore={totalScore}
      totalMaxScore={totalMaxScore}
    />
  );
}
