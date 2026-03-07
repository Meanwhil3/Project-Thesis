import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

async function isAdminOrInstructor() {
  const session = await getServerSession(authOptions);
  const role = String(session?.user?.role ?? "").toUpperCase();
  return role === "ADMIN" || role === "INSTRUCTOR";
}

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    if (!(await isAdminOrInstructor())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { courseId } = await params;
    const { title, content, status, videoUrls, attachments } = await request.json();
    const cId = BigInt(courseId);

    const lastLesson = await prisma.lessons.findFirst({
      where: { course_id: cId, deleted_at: null },
      orderBy: { order_index: "desc" }
    });
    const nextOrder = (lastLesson?.order_index ?? -1) + 1;

    const result = await prisma.$transaction(async (tx) => {
      const newLesson = await tx.lessons.create({
        data: {
          course_id: cId,
          lesson_title: title,
          lesson_content: content || "",
          lesson_status: status === "SHOW" ? "OPEN" : "CLOSED",
          order_index: nextOrder,
        }
      });

      const attachmentRecords: any[] = [];
      if (videoUrls && Array.isArray(videoUrls)) {
        videoUrls.forEach((url: string, i: number) => {
          if (url.trim()) attachmentRecords.push({
            lesson_id: newLesson.lesson_id,
            display_name: `Video ${i + 1}`,
            file_type: "VIDEO",
            file_path: url.trim(),
          });
        });
      }

      if (attachments && Array.isArray(attachments)) {
        attachments.forEach((at: any) => {
          attachmentRecords.push({
            lesson_id: newLesson.lesson_id,
            display_name: at.name,
            file_type: at.type,
            file_path: `uploads/${newLesson.lesson_id}/${Date.now()}-${at.name}`,
          });
        });
      }

      if (attachmentRecords.length > 0) await tx.lesson_Attachments.createMany({ data: attachmentRecords });
      return newLesson;
    });

    return NextResponse.json({ ...result, lesson_id: result.lesson_id.toString(), course_id: result.course_id?.toString() });
  } catch (error) { return NextResponse.json({ error: "Server Error" }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    if (!(await isAdminOrInstructor())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { courseId } = await params;
    const { lessons } = await request.json();

    await prisma.$transaction(
      lessons.map((item: any) => prisma.lessons.update({
        where: { lesson_id: BigInt(item.lesson_id), course_id: BigInt(courseId) },
        data: { order_index: item.order_index },
      }))
    );
    return NextResponse.json({ message: "Reorder success" });
  } catch (error) { return NextResponse.json({ error: "Update failed" }, { status: 500 }); }
}