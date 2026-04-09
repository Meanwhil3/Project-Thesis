// app/api/admin/courses/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";

export const runtime = "nodejs"; // ต้องใช้ fs
export const dynamic = "force-dynamic"; // กัน cache ใน dev/route

type DbCourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

const COURSE_STATUS_VALUES = new Set<string>(Object.values(CourseStatus));

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}

function formatThaiDate(d: Date | null) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    // fallback: YYYY-MM-DD
    return d.toISOString().slice(0, 10);
  }
}

/**
 * รองรับ input:
 * - "SHOW" / "HIDE"
 * - "OPEN" / "CLOSED"
 * - "open" / "closed"
 * แล้ว map ให้ตรงกับ enum CourseStatus จริงใน Prisma
 */
function normalizeCourseStatus(input: string): DbCourseStatus {
  const raw = (input ?? "").trim().toUpperCase();

  // ถ้าตรงกับค่าจริงของ enum เลย -> ใช้ได้ทันที
  if (COURSE_STATUS_VALUES.has(raw)) return raw as DbCourseStatus;

  const hasSHOW = COURSE_STATUS_VALUES.has("SHOW");
  const hasHIDE = COURSE_STATUS_VALUES.has("HIDE");
  const hasOPEN = COURSE_STATUS_VALUES.has("OPEN");
  const hasCLOSED = COURSE_STATUS_VALUES.has("CLOSED");

  // map synonyms
  if (raw === "OPEN" || raw === "SHOW") {
    if (hasOPEN) return "OPEN" as DbCourseStatus;
    if (hasSHOW) return "SHOW" as DbCourseStatus;
  }
  if (raw === "CLOSED" || raw === "HIDE" || raw === "CLOSE") {
    if (hasCLOSED) return "CLOSED" as DbCourseStatus;
    if (hasHIDE) return "HIDE" as DbCourseStatus;
  }
  if (raw === "OPEN" || raw === "OPENED") {
    if (hasOPEN) return "OPEN" as DbCourseStatus;
    if (hasSHOW) return "SHOW" as DbCourseStatus;
  }
  if (raw === "CLOSED" || raw === "CLOSE" || raw === "CLOSING") {
    if (hasCLOSED) return "CLOSED" as DbCourseStatus;
    if (hasHIDE) return "HIDE" as DbCourseStatus;
  }

  throw new Error("สถานะคอร์สไม่ถูกต้อง");
}

function isOpenStatus(status: DbCourseStatus | null | undefined) {
  if (!status) return false;
  const s = String(status).toUpperCase();
  return s === "OPEN" || s === "SHOW";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
        course_status: true,
      },
    });

    const courseIds = courses.map((c) => c.course_id);

    // ✅ groupBy ถ้าพัง ไม่ให้ล้มทั้งหน้า (enrolledCount = 0 ไปก่อน)
    let grouped: Array<{ course_id: bigint | null; _count: { _all: number } }> = [];
    if (courseIds.length) {
      try {
        grouped = (await prisma.courseEnrollments.groupBy({
          by: ["course_id"],
          where: {
            deleted_at: null,
            course_id: { in: courseIds },
          },
          _count: { _all: true },
        })) as any;
      } catch (e) {
        console.error("GET /api/admin/courses groupBy failed:", e);
        grouped = [];
      }
    }

    const countMap = new Map<string, number>();
    for (const row of grouped) {
      if (row.course_id == null) continue;
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
        status: isOpenStatus(c.course_status as any) ? "open" : "closed",
      };
    });

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/courses failed:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const role = String((session.user as any)?.role ?? "").toUpperCase();
    if (role === "TRAINEE") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();
    const subtitle = String(form.get("subtitle") ?? "").trim();
    const enrollCodeRaw = String(form.get("enrollCode") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const startDate = String(form.get("startDate") ?? "").trim(); // YYYY-MM-DD
    const endDate = String(form.get("endDate") ?? "").trim();
    const statusRaw = String(form.get("status") ?? "").trim();
    const image = form.get("image");

    // --- basic validation ---
    if (!title || !subtitle || !location || !startDate || !endDate) {
      return NextResponse.json({ message: "กรอกข้อมูลไม่ครบ" }, { status: 400 });
    }

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

    let normalizedStatus: DbCourseStatus;
    try {
      normalizedStatus = normalizeCourseStatus(statusRaw);
    } catch {
      return NextResponse.json({ message: "สถานะคอร์สไม่ถูกต้อง" }, { status: 400 });
    }

    if (!(image instanceof File)) {
      return NextResponse.json({ message: "กรุณาอัปโหลดรูปภาพ" }, { status: 400 });
    }

    const ext = extFromMime(image.type);
    if (!ext) {
      return NextResponse.json({ message: "รองรับเฉพาะ JPG/PNG/WEBP" }, { status: 415 });
    }

    const maxBytes = 5 * 1024 * 1024;
    if (image.size > maxBytes) {
      return NextResponse.json({ message: "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" }, { status: 413 });
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

    const course = await prisma.course.create({
      data: {
        course_name: title,
        enroll_code: enrollCodeRaw || null,
        course_description: subtitle,
        image_url: imageUrl,
        location,
        course_status: normalizedStatus as any,
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
    console.error("POST /api/admin/courses failed:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
