// app/(course)/courses/[courseId]/action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(courseIdStr: string, formData: FormData) {
  const session = await getServerSession(authOptions);

  // ตรวจสอบความปลอดภัยและโครงสร้างข้อมูล
  if (!session?.user) throw new Error("Unauthorized");

  const role = String((session.user as any).role ?? "").toUpperCase();
  if (role === "TRAINEE") throw new Error("Forbidden: Trainee cannot manage announcements");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const courseId = BigInt(courseIdStr);

  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;

  if (!rawUserId) {
    throw new Error("User ID not found in session. Please check your Next-Auth configuration.");
  }

  const userId = BigInt(rawUserId);

  // ตรวจสอบว่าเป็น ADMIN หรือเป็น Instructor ของคอร์สนี้
  if (role !== "ADMIN") {
    const isInstructor = await prisma.instructor.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } },
    });
    if (!isInstructor) {
      throw new Error("Forbidden: Only course creator or assigned instructors can create announcements");
    }
  }

  await prisma.announcements.create({
    data: {
      course_id: courseId,
      title: title,
      content: content,
      created_by: userId,
      created_at: new Date(),
    },
  });

  revalidatePath(`/courses/${courseIdStr}`);
}

export async function updateAnnouncement(
  courseIdStr: string,
  announcementIdStr: string,
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const role = String((session.user as any).role ?? "").toUpperCase();
  if (role === "TRAINEE") throw new Error("Forbidden: Trainee cannot manage announcements");

  const courseId = BigInt(courseIdStr);
  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;
  if (!rawUserId) throw new Error("User ID not found in session");
  const userId = BigInt(rawUserId);

  if (role !== "ADMIN") {
    const isInstructor = await prisma.instructor.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } },
    });
    if (!isInstructor) {
      throw new Error("Forbidden: Only course creator or assigned instructors can manage announcements");
    }
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const announcementId = BigInt(announcementIdStr);

  await prisma.announcements.update({
    where: { announcement_id: announcementId },
    data: { title, content },
  });

  revalidatePath(`/courses/${courseIdStr}`);
}

export async function deleteAnnouncement(
  courseIdStr: string,
  announcementIdStr: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const role = String((session.user as any).role ?? "").toUpperCase();
  if (role === "TRAINEE") throw new Error("Forbidden: Trainee cannot manage announcements");

  const courseId = BigInt(courseIdStr);
  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;
  if (!rawUserId) throw new Error("User ID not found in session");
  const userId = BigInt(rawUserId);

  if (role !== "ADMIN") {
    const isInstructor = await prisma.instructor.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } },
    });
    if (!isInstructor) {
      throw new Error("Forbidden: Only course creator or assigned instructors can manage announcements");
    }
  }

  const announcementId = BigInt(announcementIdStr);

  await prisma.announcements.update({
    where: { announcement_id: announcementId },
    data: { deleted_at: new Date() },
  });

  revalidatePath(`/courses/${courseIdStr}`);
}

// ─── Instructor Check ───

export async function checkIsCourseInstructor(courseIdStr: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const role = String((session.user as any).role ?? "").toUpperCase();
  if (role === "ADMIN") return true;

  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;
  if (!rawUserId) return false;

  const isInstructor = await prisma.instructor.findUnique({
    where: {
      user_id_course_id: {
        user_id: BigInt(rawUserId),
        course_id: BigInt(courseIdStr),
      },
    },
  });

  return !!isInstructor;
}

// ─── Instructor Management ───

export async function getInstructorCandidates() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const role = String((session.user as any).role ?? "").toUpperCase();
  if (role !== "ADMIN") throw new Error("Forbidden");

  const instructorRoles = await prisma.role.findMany({
    where: { name: { in: ["INSTRUCTOR", "EXAMINER"] } },
    select: { role_id: true },
  });
  if (!instructorRoles.length) return [];

  const roleIds = instructorRoles.map((r) => r.role_id);

  const users = await prisma.user.findMany({
    where: {
      role_id: { in: roleIds },
      deleted_at: null,
      is_active: true,
    },
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      email: true,
    },
    orderBy: { first_name: "asc" },
  });

  return users.map((u) => ({
    userId: u.user_id.toString(),
    name: `${u.first_name} ${u.last_name}`.trim(),
    email: u.email,
  }));
}

export async function addInstructor(courseIdStr: string, userIdStr: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const role = String((session.user as any).role ?? "").toUpperCase();
  if (role !== "ADMIN") throw new Error("Forbidden");

  const courseId = BigInt(courseIdStr);
  const userId = BigInt(userIdStr);

  const existing = await prisma.instructor.findUnique({
    where: { user_id_course_id: { user_id: userId, course_id: courseId } },
  });

  if (!existing) {
    await prisma.instructor.create({
      data: {
        user_id: userId,
        course_id: courseId,
      },
    });
  }

  revalidatePath(`/courses/${courseIdStr}`);
}

export async function removeInstructor(courseIdStr: string, userIdStr: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const role = String((session.user as any).role ?? "").toUpperCase();
  if (role !== "ADMIN") throw new Error("Forbidden");

  const courseId = BigInt(courseIdStr);
  const userId = BigInt(userIdStr);

  await prisma.instructor.delete({
    where: { user_id_course_id: { user_id: userId, course_id: courseId } },
  });

  revalidatePath(`/courses/${courseIdStr}`);
}