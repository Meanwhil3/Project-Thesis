// app/api/admin/courses/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs"; // ต้องใช้ fs

const prisma = new PrismaClient();

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}

function formatThaiDate(d: Date | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
      select: {
        course_id: true,
        course_name: true,
        course_description: true,
        image_url: true,
        location: true,
        start_date: true,
        end_date: true,
        course_status: true, // SHOW | HIDE
      },
    });

    const courseIds = courses.map((c) => c.course_id);

    // นับผู้ลงทะเบียนแบบไม่ต้องดึง enrollments ทั้งก้อน (เร็วและ payload น้อย)
    const grouped = courseIds.length
      ? await prisma.courseEnrollments.groupBy({
          by: ["course_id"],
          where: {
            deleted_at: null,
            course_id: { in: courseIds },
          },
          _count: { _all: true },
        })
      : [];

    const countMap = new Map<string, number>();

    for (const row of grouped) {
      if (row.course_id == null) continue; // กัน type ที่ยังมองว่า nullable
      countMap.set(String(row.course_id), row._count._all);
    }

    const items = courses.map((c) => {
      const id = c.course_id.toString();
      return {
        id,
        title: c.course_name,
        subtitle: c.course_description ?? "",
        imageUrl: c.image_url ?? "https://placehold.co/760x380",
        location: c.location ?? "",
        startDate: formatThaiDate(c.start_date),
        endDate: formatThaiDate(c.end_date),
        enrolledCount: countMap.get(id) ?? 0,
        status: c.course_status === "SHOW" ? "open" : "closed",
      };
    });

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();
    const subtitle = String(form.get("subtitle") ?? "").trim();
    const enrollCodeRaw = String(form.get("enrollCode") ?? "").trim(); // ✅ NEW
    const location = String(form.get("location") ?? "").trim();
    const startDate = String(form.get("startDate") ?? "").trim(); // YYYY-MM-DD
    const endDate = String(form.get("endDate") ?? "").trim();
    const statusRaw = String(form.get("status") ?? "").trim(); // should be SHOW/HIDE
    const image = form.get("image");

    // --- basic validation ---
    if (!title || !subtitle || !location || !startDate || !endDate) {
      return NextResponse.json(
        { message: "กรอกข้อมูลไม่ครบ" },
        { status: 400 },
      );
    }

    // if (!enrollCodeRaw) {
    //   return NextResponse.json({ message: "กรุณากรอกรหัสเข้าคอร์ส" }, { status: 400 });
    // }
    if (enrollCodeRaw.length > 255) {
      return NextResponse.json(
        { message: "รหัสเข้าคอร์สยาวเกินไป (สูงสุด 255 ตัวอักษร)" },
        { status: 400 },
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { message: "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่ม" },
        { status: 400 },
      );
    }

    // validate status to enum SHOW/HIDE
    if (statusRaw !== "SHOW" && statusRaw !== "HIDE") {
      return NextResponse.json(
        { message: "สถานะคอร์สไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    if (!(image instanceof File)) {
      return NextResponse.json(
        { message: "กรุณาอัปโหลดรูปภาพ" },
        { status: 400 },
      );
    }

    const ext = extFromMime(image.type);
    if (!ext) {
      return NextResponse.json(
        { message: "รองรับเฉพาะ JPG/PNG/WEBP" },
        { status: 415 },
      );
    }
    const maxBytes = 5 * 1024 * 1024;
    if (image.size > maxBytes) {
      return NextResponse.json(
        { message: "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" },
        { status: 413 },
      );
    }

    // Save file to /public/uploads/courses
    const uploadDir = path.join(process.cwd(), "public", "uploads", "courses");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    const arrayBuffer = await image.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(arrayBuffer));

    const imageUrl = `/uploads/courses/${filename}`;

    // Parse dates as Bangkok midnight to avoid day shift
    const start = new Date(`${startDate}T00:00:00+07:00`);
    const end = new Date(`${endDate}T00:00:00+07:00`);

    // Create course
    const course = await prisma.course.create({
      data: {
        course_name: title,
        enroll_code: enrollCodeRaw || null, // ✅ NEW (schema: enroll_code)
        course_description: subtitle,
        image_url: imageUrl,
        location,
        course_status: statusRaw as any, // ✅ NOW strictly SHOW/HIDE
        start_date: start,
        end_date: end,
      },
      select: {
        course_id: true,
        course_name: true,
        image_url: true,
        enroll_code: true,
      },
    });

    return NextResponse.json(
      {
        course_id: course.course_id.toString(),
        course_name: course.course_name,
        image_url: course.image_url,
        enroll_code: course.enroll_code,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
