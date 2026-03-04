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



