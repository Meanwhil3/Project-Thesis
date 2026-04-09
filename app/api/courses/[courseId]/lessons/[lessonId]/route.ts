import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;

    const lesson = await prisma.lessons.findUnique({
      where: { 
        lesson_id: BigInt(lessonId),
        course_id: BigInt(courseId),
        deleted_at: null 
      },
      include: { 
        attachments: true,
        author: {
          select: {
            first_name: true,
            last_name: true,
          }
        },
        course: { select: { course_name: true } }
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "ไม่พบบทเรียน" }, { status: 404 });
    }

    // กรองแยกประเภทข้อมูล
    const videos = lesson.attachments.filter(at => at.file_type === "VIDEO");
    const documents = lesson.attachments.filter(at => at.file_type !== "VIDEO");

    return NextResponse.json({
      title: lesson.lesson_title,
      content: lesson.lesson_content,
      courseName: lesson.course?.course_name || "Unknown Course",
      authorName: lesson.author 
        ? `${lesson.author.first_name} ${lesson.author.last_name}` 
        : "ไม่ระบุผู้เขียน",
      createdAt: lesson.created_at,
      // ส่งข้อมูลวิดีโอ
      videos: videos.map(v => ({ 
        url: v.file_path, 
        title: v.display_name,
        type: v.file_type // ส่งประเภทไปด้วยเพื่อความชัวร์
      })),
      // ส่งข้อมูลเอกสาร
      documents: documents.map(d => ({
        id: d.attachment_id.toString(), // แปลง BigInt เป็น String
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