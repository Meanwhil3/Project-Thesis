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

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  const courseId = BigInt(courseIdStr);

  // แก้ไขจุดนี้: ลองดึงจาก id, user_id หรือ sub (ที่มักจะเป็น Default ของ Next-Auth)
  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;

  if (!rawUserId) {
    throw new Error("User ID not found in session. Please check your Next-Auth configuration.");
  }

  const userId = BigInt(rawUserId);

  await prisma.announcements.create({
    data: {
      course_id: courseId,
      title: title,
      content: content,
      created_by: userId,
    },
  });

  revalidatePath(`/courses/${courseIdStr}`);
}