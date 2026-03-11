import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

async function getAuthenticatedUser(courseId: bigint) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = String((session.user as any).role ?? "").toUpperCase();
  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;
  if (!rawUserId) return null;

  const userId = BigInt(rawUserId);

  if (role === "ADMIN") {
    return { userId, role };
  }

  const isInstructor = await prisma.instructor.findUnique({
    where: { user_id_course_id: { user_id: userId, course_id: courseId } },
  });
  if (isInstructor) {
    return { userId, role: "COURSE_INSTRUCTOR" };
  }

  return null;
}

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
    const { courseId, lessonId } = await params;
    const auth = await getAuthenticatedUser(BigInt(courseId));
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const contentType = req.headers.get("content-type") || "";

    // รองรับ toggle status แบบ JSON
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.toggleOnly) {
        const mappedStatus = body.status === "SHOW" ? "OPEN" : "CLOSED";
        await prisma.lessons.update({
          where: { lesson_id: BigInt(lessonId) },
          data: { lesson_status: mappedStatus as any },
        });
        return NextResponse.json({ message: "อัปเดตสถานะสำเร็จ" });
      }
      return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
    }

    // FormData update (full edit)
    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim();
    const content = String(form.get("content") ?? "");
    const status = String(form.get("status") ?? "HIDE");
    const videoUrls: { url: string; title: string }[] = JSON.parse(String(form.get("videoUrls") ?? "[]"));
    const existingPathEntries = form.getAll("existingPaths") as string[];
    const files = form.getAll("files") as File[];
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

      // ลบ attachments เก่าทั้งหมด
      await tx.lesson_Attachments.deleteMany({ where: { lesson_id: BigInt(lessonId) } });

      const attachmentRecords: any[] = [];

      // Video URLs
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

      // ไฟล์เดิมที่ยังคงอยู่ (ไม่ได้ลบ)
      for (const ep of existingPathEntries) {
        try {
          const parsed = JSON.parse(ep);
          attachmentRecords.push({
            lesson_id: BigInt(lessonId),
            display_name: parsed.name,
            file_type: parsed.type,
            file_path: parsed.path,
          });
        } catch { /* skip invalid entries */ }
      }

      // ไฟล์ใหม่ที่อัปโหลด
      if (files.length > 0) {
        const uploadDir = path.join(process.cwd(), "uploads", "lessons", lessonId);
        await fs.mkdir(uploadDir, { recursive: true });

        for (const file of files) {
          const ext = file.name.split(".").pop() || "file";
          const filename = `${crypto.randomUUID()}.${ext}`;
          const filepath = path.join(uploadDir, filename);

          const arrayBuffer = await file.arrayBuffer();
          await fs.writeFile(filepath, Buffer.from(arrayBuffer));

          attachmentRecords.push({
            lesson_id: BigInt(lessonId),
            display_name: file.name,
            file_type: ext.toUpperCase(),
            file_path: `/api/download/lessons/${lessonId}/${filename}`,
          });
        }
      }

      if (attachmentRecords.length > 0) {
        await tx.lesson_Attachments.createMany({ data: attachmentRecords });
      }
    });

    return NextResponse.json({ message: "บันทึกสำเร็จ" });
  } catch (error) {
    console.error("PUT_LESSON_ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;
    const auth = await getAuthenticatedUser(BigInt(courseId));
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = BigInt(lessonId);

    await prisma.$transaction(async (tx) => {
      await tx.lesson_Attachments.deleteMany({ where: { lesson_id: id } });
      await tx.lessons.delete({ where: { lesson_id: id } });
    });

    // ลบโฟลเดอร์ไฟล์ (ถ้ามี)
    const uploadDir = path.join(process.cwd(), "uploads", "lessons", lessonId);
    await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});

    return NextResponse.json({ message: "ลบสำเร็จ" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
