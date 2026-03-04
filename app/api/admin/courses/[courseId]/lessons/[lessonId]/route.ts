// api/admin/courses/[courseId]/lessons/[lessonId]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    const lesson = await prisma.lessons.findUnique({
      where: { lesson_id: BigInt(lessonId) },
      include: { attachments: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "ไม่พบบทเรียน" }, { status: 404 });
    }

    // แยกวิดีโอ (file_type: "VIDEO") ออกมา
    const videoAttachments = lesson.attachments.filter(at => at.file_type === "VIDEO");
    const docAttachments = lesson.attachments.filter(at => at.file_type !== "VIDEO");

    return NextResponse.json({
      lesson_title: lesson.lesson_title,
      lesson_content: lesson.lesson_content,
      lesson_status: lesson.lesson_status === "OPEN" ? "SHOW" : "HIDE",
      // ส่งเป็น Array ของวิดีโอเพื่อให้สอดคล้องกับ List ในหน้า Edit
      video_list: videoAttachments.map(v => ({
        url: v.file_path,
        title: v.display_name
      })),
      attachments: docAttachments.map((at) => ({
        id: at.attachment_id.toString(),
        name: at.display_name,
        type: at.file_type,
        path: at.file_path
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const { title, content, status, videoUrls, attachments } = await req.json();

    const mappedStatus = status === "SHOW" ? "OPEN" : "CLOSED";

    await prisma.$transaction(async (tx) => {
      await tx.lessons.update({
        where: { lesson_id: BigInt(lessonId) },
        data: {
          lesson_title: title,
          lesson_content: content,
          lesson_status: mappedStatus as any,
        },
      });

      await tx.lesson_Attachments.deleteMany({
        where: { lesson_id: BigInt(lessonId) }
      });

      const attachmentRecords = [];

      // บันทึกวิดีโอ (ใช้ URL และข้อมูลที่ส่งมา)
      if (videoUrls && Array.isArray(videoUrls)) {
        videoUrls.forEach((v: any, index: number) => {
          attachmentRecords.push({
            lesson_id: BigInt(lessonId),
            display_name: v.title || `Video ${index + 1}`,
            file_type: "VIDEO",
            file_path: v.url,
          });
        });
      }

      // บันทึกไฟล์เอกสาร
      if (attachments && Array.isArray(attachments)) {
        attachments.forEach((at: any) => {
          attachmentRecords.push({
            lesson_id: BigInt(lessonId),
            display_name: at.name,
            file_type: at.type,
            file_path: at.path || `uploads/${lessonId}-${Date.now()}-${at.name}`,
          });
        });
      }

      if (attachmentRecords.length > 0) {
        await tx.lesson_Attachments.createMany({ data: attachmentRecords });
      }
    });

    return NextResponse.json({ message: "บันทึกสำเร็จ" });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}