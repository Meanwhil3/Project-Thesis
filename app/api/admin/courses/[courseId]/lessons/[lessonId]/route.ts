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

    if (!lesson) return NextResponse.json({ error: "ไม่พบบทเรียน" }, { status: 404 });

    const videoAttachments = lesson.attachments.filter(at => at.file_type === "VIDEO");
    const docAttachments = lesson.attachments.filter(at => at.file_type !== "VIDEO");

    return NextResponse.json({
      lesson_title: lesson.lesson_title,
      lesson_content: lesson.lesson_content,
      lesson_status: lesson.lesson_status === "OPEN" ? "SHOW" : "HIDE",
      video_list: videoAttachments.map(v => ({ url: v.file_path, title: v.display_name })),
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
    const body = await req.json();

    // --- ส่วนที่เพิ่ม: รองรับการ Toggle Status อย่างเดียว ---
    if (body.toggleOnly) {
      const mappedStatus = body.status === "SHOW" ? "OPEN" : "CLOSED";
      await prisma.lessons.update({
        where: { lesson_id: BigInt(lessonId) },
        data: { lesson_status: mappedStatus as any },
      });
      return NextResponse.json({ message: "อัปเดตสถานะสำเร็จ" });
    }

    // --- Logic การอัปเดตเต็มรูปแบบ (ของเดิม) ---
    const { title, content, status, videoUrls, attachments } = body;
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

      await tx.lesson_Attachments.deleteMany({ where: { lesson_id: BigInt(lessonId) } });

      const attachmentRecords = [];
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const id = BigInt(lessonId);

    await prisma.$transaction(async (tx) => {
      await tx.lesson_Attachments.deleteMany({ where: { lesson_id: id } });
      await tx.lessons.delete({ where: { lesson_id: id } });
    });

    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}