import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/**
 * ฟังก์ชันช่วยตรวจสอบ Session และสิทธิ์
 * คืนค่า User Object หากมีสิทธิ์ หรือ null หากไม่มีสิทธิ์
 */
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = String((session.user as any).role ?? "").toUpperCase();
  const isAuthorized = role === "ADMIN" || role === "INSTRUCTOR";
  
  if (!isAuthorized) return null;

  // ดึง ID จาก session (รองรับหลายรูปแบบตามการ config next-auth)
  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;

  return {
    userId: rawUserId ? BigInt(rawUserId) : null,
    role
  };
}

export async function POST(
  request: Request, 
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // 1. ตรวจสอบสิทธิ์และดึง User ID
    const auth = await getAuthenticatedUser();
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Forbidden: Unauthorized access" }, { status: 403 });
    }

    const { courseId } = await params;
    const { title, content, status, videoUrls, attachments } = await request.json();
    const cId = BigInt(courseId);

    // 2. หาลำดับ (order_index) ล่าสุด
    const lastLesson = await prisma.lessons.findFirst({
      where: { course_id: cId, deleted_at: null },
      orderBy: { order_index: "desc" }
    });
    const nextOrder = (lastLesson?.order_index ?? -1) + 1;

    // 3. เริ่ม Transaction เพื่อสร้าง Lesson และ Attachments
    const result = await prisma.$transaction(async (tx) => {
      // สร้างบทเรียนใหม่พร้อมเก็บ created_by
      const newLesson = await tx.lessons.create({
        data: {
          course_id: cId,
          lesson_title: title,
          lesson_content: content || "",
          lesson_status: status === "SHOW" ? "OPEN" : "CLOSED",
          order_index: nextOrder,
          created_by: auth.userId, // บันทึก ID ผู้สร้างลงในฐานข้อมูล
        }
      });

      const attachmentRecords: any[] = [];

      // จัดการข้อมูล Video URLs
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

      // จัดการข้อมูลไฟล์แนบ (Mock path ไว้รอการอัปโหลดจริง)
      if (attachments && Array.isArray(attachments)) {
        attachments.forEach((at: any) => {
          attachmentRecords.push({
            lesson_id: newLesson.lesson_id,
            display_name: at.name,
            file_type: at.type || "FILE",
            file_path: `uploads/${newLesson.lesson_id}/${Date.now()}-${at.name}`,
          });
        });
      }

      // บันทึก Attachments ทั้งหมด (ถ้ามี)
      if (attachmentRecords.length > 0) {
        await tx.lesson_Attachments.createMany({ 
          data: attachmentRecords 
        });
      }

      return newLesson;
    });

    // 4. ส่งค่ากลับ (แปลง BigInt เป็น String เพื่อป้องกัน Error ของ JSON)
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
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { courseId } = await params;
    const { lessons } = await request.json();

    // ทำการ Update order_index หลายรายการพร้อมกัน
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