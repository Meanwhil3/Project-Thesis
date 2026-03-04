import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;

    // ตรวจสอบความถูกต้องของ ID
    if (!lessonId || isNaN(Number(lessonId))) {
      return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 });
    }

    const lesson = await prisma.lessons.findUnique({
      where: { 
        lesson_id: BigInt(lessonId),
        course_id: BigInt(courseId),
        deleted_at: null 
      },
      include: { 
        attachments: true,
        course: { select: { course_name: true } }
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "ไม่พบบทเรียน" }, { status: 404 });
    }

    // แยกวิดีโอและเอกสารจากตารางเดียวกัน
    const videos = lesson.attachments.filter(at => at.file_type === "VIDEO");
    const documents = lesson.attachments.filter(at => at.file_type !== "VIDEO");

    return NextResponse.json({
      title: lesson.lesson_title,
      content: lesson.lesson_content,
      courseName: lesson.course?.course_name,
      courseId: lesson.course_id?.toString(),
      videos: videos.map(v => ({ url: v.file_path, title: v.display_name })),
      documents: documents.map(d => ({
        id: d.attachment_id.toString(),
        name: d.display_name,
        path: d.file_path,
        type: d.file_type
      }))
    });
  } catch (error) {
    console.error("GET Lesson Detail Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}