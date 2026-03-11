import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

async function getAuthenticatedUser(courseId?: bigint) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = String((session.user as any).role ?? "").toUpperCase();
  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;
  if (!rawUserId) return null;

  const userId = BigInt(rawUserId);

  // ADMIN สามารถจัดการได้ทุกคอร์ส
  if (role === "ADMIN") {
    return { userId, role };
  }

  // ตรวจสอบว่าเป็น Instructor ที่ถูกเพิ่มในคอร์สนี้หรือไม่
  if (courseId) {
    const isInstructor = await prisma.instructor.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } },
    });
    if (isInstructor) {
      return { userId, role: "COURSE_INSTRUCTOR" };
    }
  }

  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const cId = BigInt(courseId);

    const auth = await getAuthenticatedUser(cId);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Forbidden: Unauthorized access" }, { status: 403 });
    }

    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    const content = String(form.get("content") ?? "");
    const status = String(form.get("status") ?? "HIDE");
    const videoUrls: string[] = JSON.parse(String(form.get("videoUrls") ?? "[]"));
    const files = form.getAll("files") as File[];

    if (!title) {
      return NextResponse.json({ error: "กรุณาระบุชื่อบทเรียน" }, { status: 400 });
    }

    // หาลำดับ (order_index) ล่าสุด
    const lastLesson = await prisma.lessons.findFirst({
      where: { course_id: cId, deleted_at: null },
      orderBy: { order_index: "desc" }
    });
    const nextOrder = (lastLesson?.order_index ?? -1) + 1;

    // สร้าง Lesson ก่อนเพื่อเอา lesson_id
    const result = await prisma.$transaction(async (tx) => {
      const newLesson = await tx.lessons.create({
        data: {
          course_id: cId,
          lesson_title: title,
          lesson_content: content,
          lesson_status: status === "SHOW" ? "OPEN" : "CLOSED",
          order_index: nextOrder,
          created_by: auth.userId,
        }
      });

      const attachmentRecords: any[] = [];

      // จัดการ Video URLs
      if (videoUrls && Array.isArray(videoUrls)) {
        videoUrls.forEach((url: string, i: number) => {
          if (url.trim()) {
            attachmentRecords.push({
              lesson_id: newLesson.lesson_id,
              display_name: `Video ${i + 1}`,
              file_type: "VIDEO",
              file_path: url.trim(),
            });
          }
        });
      }

      // จัดการไฟล์แนบ - บันทึกลง disk จริง
      if (files.length > 0) {
        const lessonIdStr = String(newLesson.lesson_id);
        const uploadDir = path.join(process.cwd(), "uploads", "lessons", lessonIdStr);
        await fs.mkdir(uploadDir, { recursive: true });

        for (const file of files) {
          const ext = file.name.split(".").pop() || "file";
          const filename = `${crypto.randomUUID()}.${ext}`;
          const filepath = path.join(uploadDir, filename);

          const arrayBuffer = await file.arrayBuffer();
          await fs.writeFile(filepath, Buffer.from(arrayBuffer));

          attachmentRecords.push({
            lesson_id: newLesson.lesson_id,
            display_name: file.name,
            file_type: ext.toUpperCase(),
            file_path: `/api/download/lessons/${lessonIdStr}/${filename}`,
          });
        }
      }

      if (attachmentRecords.length > 0) {
        await tx.lesson_Attachments.createMany({ data: attachmentRecords });
      }

      return newLesson;
    });

    return NextResponse.json({
      ...result,
      lesson_id: result.lesson_id.toString(),
      course_id: result.course_id?.toString(),
      created_by: result.created_by?.toString()
    });

  } catch (error) {
    console.error("POST_LESSON_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const auth = await getAuthenticatedUser(BigInt(courseId));
    if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { lessons } = await request.json();

    await prisma.$transaction(
      lessons.map((item: any) =>
        prisma.lessons.update({
          where: {
            lesson_id: BigInt(item.lesson_id),
            course_id: BigInt(courseId)
          },
          data: { order_index: item.order_index },
        })
      )
    );

    return NextResponse.json({ message: "Reorder success" });
  } catch (error) {
    console.error("PUT_LESSON_ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
