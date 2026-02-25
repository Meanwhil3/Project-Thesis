// app/api/course/[courseId]/lesson/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { title, content } = await request.json();

    // 1. ตรวจสอบว่า courseId มีค่าจริงไหม
    if (!courseId || courseId === "undefined") {
      return NextResponse.json({ error: "ไม่พบรหัสคอร์ส" }, { status: 400 });
    }

    const cId = BigInt(courseId);

    // 2. หาลำดับ (Order Index)
    const lastLesson = await prisma.lessons.findFirst({
      where: { course_id: cId },
      orderBy: { order_index: "desc" },
    });
    const nextOrder = (lastLesson?.order_index ?? -1) + 1;

    // 3. บันทึกข้อมูล
    const newLesson = await prisma.lessons.create({
      data: {
        course_id: cId,
        lesson_title: title,
        lesson_content: content || "",
        lesson_status: "OPEN",
        order_index: nextOrder,
      },
    });

    return NextResponse.json({
      ...newLesson,
      lesson_id: newLesson.lesson_id.toString(),
      course_id: newLesson.course_id?.toString(),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET สำหรับดึงข้อมูลใน Path เดียวกัน
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const lessons = await prisma.lessons.findMany({
      where: { course_id: BigInt(courseId), deleted_at: null },
      orderBy: { order_index: "asc" },
    });

    const serialized = lessons.map((l) => ({
      ...l,
      lesson_id: l.lesson_id.toString(),
      course_id: l.course_id?.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}