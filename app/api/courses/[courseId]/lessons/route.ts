import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ดึงจากส่วนกลางที่ทำ Singleton ไว้

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    
    // ตรวจสอบค่าก่อน Query
    if (!courseId) return NextResponse.json({ error: "Course ID is required" }, { status: 400 });

    const lessons = await prisma.lessons.findMany({
      where: { 
        course_id: BigInt(courseId), 
        deleted_at: null 
      },
      orderBy: { order_index: "asc" },
    });

    // แปลง BigInt เป็น String ก่อนส่งกลับ
    return NextResponse.json(
      lessons.map((l) => ({ 
        ...l, 
        lesson_id: l.lesson_id.toString(), 
        course_id: l.course_id?.toString(),
        created_by: l.created_by?.toString() // อย่าลืมตัวนี้ด้วย
      }))
    );
  } catch (error) { 
    console.error("FETCH_LESSONS_ERROR:", error);
    return NextResponse.json({ error: "Fetch error" }, { status: 500 }); 
  }
}