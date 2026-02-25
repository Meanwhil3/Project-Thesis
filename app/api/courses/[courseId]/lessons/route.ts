import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: ดึงข้อมูล
export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const lessons = await prisma.lessons.findMany({
      where: { course_id: BigInt(courseId), deleted_at: null },
      orderBy: { order_index: "asc" },
    });
    return NextResponse.json(lessons.map((l) => ({ ...l, lesson_id: l.lesson_id.toString(), course_id: l.course_id?.toString() })));
  } catch (error) { return NextResponse.json({ error: "Fetch error" }, { status: 500 }); }
}

// POST: เพิ่มข้อมูล
export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const { title, content } = await request.json();
    const cId = BigInt(courseId);
    const lastLesson = await prisma.lessons.findFirst({ where: { course_id: cId, deleted_at: null }, orderBy: { order_index: "desc" } });
    const nextOrder = (lastLesson?.order_index ?? -1) + 1;
    const newLesson = await prisma.lessons.create({ data: { course_id: cId, lesson_title: title, lesson_content: content || "", lesson_status: "OPEN", order_index: nextOrder } });
    return NextResponse.json({ ...newLesson, lesson_id: newLesson.lesson_id.toString(), course_id: newLesson.course_id?.toString() });
  } catch (error) { return NextResponse.json({ error: "Create error" }, { status: 500 }); }
}

// PUT: แก้ไขลำดับ (แก้ไขปัญหา Error 405)
export async function PUT(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const { lessons } = await request.json(); // รับ Array [{lesson_id, order_index}]

    // ใช้ Transaction เพื่อความปลอดภัย
    await prisma.$transaction(
      lessons.map((item: any) =>
        prisma.lessons.update({
          where: { 
            lesson_id: BigInt(item.lesson_id),
            course_id: BigInt(courseId) // ล็อกไว้ว่าต้องเป็นของคอร์สนี้เท่านั้น
          },
          data: { order_index: item.order_index },
        })
      )
    );

    return NextResponse.json({ message: "Reorder success" });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}