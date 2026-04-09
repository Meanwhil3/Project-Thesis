import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = String((session?.user as any)?.role ?? "").toUpperCase();
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- counts ---
    const [
      totalCourses,
      openCourses,
      totalUsers,
      totalWoods,
      totalExams,
      totalLessons,
      totalEnrollments,
      totalAttempts,
      completedAttempts,
    ] = await Promise.all([
      prisma.course.count({ where: { deleted_at: null } }),
      prisma.course.count({ where: { deleted_at: null, course_status: "OPEN" } }),
      prisma.user.count({ where: { deleted_at: null } }),
      prisma.wood.count({ where: { deleted_at: null } }),
      prisma.exams.count({ where: { deleted_at: null } }),
      prisma.lessons.count({ where: { deleted_at: null } }),
      prisma.courseEnrollments.count({ where: { deleted_at: null } }),
      prisma.exam_Attempts.count({ where: { deleted_at: null } }),
      prisma.exam_Attempts.count({
        where: { deleted_at: null, attempt_status: "COMPLETED" },
      }),
    ]);

    // --- users by role ---
    const roles = await prisma.role.findMany();
    const roleMap = Object.fromEntries(
      roles.map((r) => [r.role_id.toString(), r.name])
    );

    const usersByRole = await prisma.user.groupBy({
      by: ["role_id"],
      where: { deleted_at: null },
      _count: true,
    });

    const userRoleCounts = usersByRole.map((g) => ({
      role: roleMap[g.role_id.toString()] ?? "Unknown",
      count: g._count,
    }));

    // --- recent courses (simple query, count separately) ---
    const recentCoursesRaw = await prisma.course.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
      take: 5,
      select: {
        course_id: true,
        course_name: true,
        course_status: true,
        created_at: true,
      },
    });

    const recentCourses = await Promise.all(
      recentCoursesRaw.map(async (c) => {
        const [enrollments, lessons, exams] = await Promise.all([
          prisma.courseEnrollments.count({ where: { course_id: c.course_id, deleted_at: null } }),
          prisma.lessons.count({ where: { course_id: c.course_id, deleted_at: null } }),
          prisma.exams.count({ where: { course_id: c.course_id, deleted_at: null } }),
        ]);
        return { ...c, _count: { enrollments, lessons, exams } };
      })
    );

    // --- recent exam attempts ---
    let recentAttempts: {
      attempt_id: bigint;
      total_score: number;
      submit_datetime: Date | null;
      user: { first_name: string; last_name: string };
      exam: { exam_title: string };
    }[] = [];

    try {
      recentAttempts = await prisma.exam_Attempts.findMany({
        where: { deleted_at: null, attempt_status: "COMPLETED" },
        orderBy: { submit_datetime: "desc" },
        take: 5,
        select: {
          attempt_id: true,
          total_score: true,
          submit_datetime: true,
          user: { select: { first_name: true, last_name: true } },
          exam: { select: { exam_title: true } },
        },
      });
    } catch {
      // ถ้ายังไม่มี data ก็ข้ามไป
      recentAttempts = [];
    }

    // --- woods by weight ---
    const woodsByWeight = await prisma.wood.groupBy({
      by: ["wood_weight"],
      where: { deleted_at: null, wood_weight: { not: null } },
      _count: true,
    });

    return NextResponse.json(
      serialize({
        stats: {
          totalCourses,
          openCourses,
          totalUsers,
          totalWoods,
          totalExams,
          totalLessons,
          totalEnrollments,
          totalAttempts,
          completedAttempts,
        },
        userRoleCounts,
        recentCourses,
        recentAttempts,
        woodsByWeight: woodsByWeight.map((w) => ({
          weight: w.wood_weight,
          count: w._count,
        })),
      })
    );
  } catch (err) {
    console.error("[dashboard] API error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
