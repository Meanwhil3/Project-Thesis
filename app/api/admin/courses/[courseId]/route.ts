import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId: courseIdStr } = await params;

  let courseId: bigint;
  try {
    courseId = BigInt(courseIdStr);
  } catch {
    return NextResponse.json({ message: "Invalid courseId" }, { status: 400 });
  }

  const c = await prisma.course.findUnique({
    where: { course_id: courseId },
    select: {
      course_id: true,
      course_name: true,
      course_description: true,
      enroll_code: true,
      image_url: true,
      location: true,
      start_date: true,
      end_date: true,
      course_status: true,
      deleted_at: true,
    },
  });

  if (!c || c.deleted_at) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: c.course_id.toString(),
      title: c.course_name,
      subtitle: c.course_description ?? "",
      enrollCode: c.enroll_code ?? "",
      imageUrl: c.image_url ?? "",
      location: c.location ?? "",
      startDate: c.start_date?.toISOString(),
      endDate: c.end_date?.toISOString(),
      status: c.course_status,
    },
    { status: 200 }
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId: courseIdStr } = await params;

  let courseId: bigint;
  try {
    courseId = BigInt(courseIdStr);
  } catch {
    return NextResponse.json({ message: "Invalid courseId" }, { status: 400 });
  }

  const form = await req.formData();

  const title = String(form.get("title") ?? "").trim();
  const subtitle = String(form.get("subtitle") ?? "").trim();
  const enrollCode = String(form.get("enrollCode") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const startDate = String(form.get("startDate") ?? "").trim(); // YYYY-MM-DD
  const endDate = String(form.get("endDate") ?? "").trim();     // YYYY-MM-DD
  const statusRaw = String(form.get("status") ?? "").trim();    // SHOW/HIDE
  const image = form.get("image");

  if (!title || !subtitle || !location || !startDate || !endDate) {
    return NextResponse.json({ message: "กรอกข้อมูลไม่ครบ" }, { status: 400 });
  }
  if (subtitle.length > 180) {
    return NextResponse.json({ message: "คำอธิบายยาวเกิน 180 ตัวอักษร" }, { status: 400 });
  }
  if (!enrollCode) {
    return NextResponse.json({ message: "กรุณากรอกรหัสเข้าคอร์ส" }, { status: 400 });
  }
  if (enrollCode.length > 255) {
    return NextResponse.json({ message: "รหัสเข้าคอร์สยาวเกินไป (สูงสุด 255)" }, { status: 400 });
  }
  if (endDate < startDate) {
    return NextResponse.json({ message: "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่ม" }, { status: 400 });
  }
  if (statusRaw !== "SHOW" && statusRaw !== "HIDE") {
    return NextResponse.json({ message: "สถานะคอร์สไม่ถูกต้อง" }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({
    where: { course_id: courseId },
    select: { image_url: true, deleted_at: true },
  });

  if (!existing || existing.deleted_at) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  let imageUrl = existing.image_url ?? null;

  // ถ้ามีอัปโหลดรูปใหม่ ค่อยเซฟ
  if (image instanceof File) {
    const ext = extFromMime(image.type);
    if (!ext) {
      return NextResponse.json({ message: "รองรับเฉพาะ JPG/PNG/WEBP" }, { status: 415 });
    }
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" }, { status: 413 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "courses");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    const arrayBuffer = await image.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(arrayBuffer));

    imageUrl = `/uploads/courses/${filename}`;
  }

  const start = new Date(`${startDate}T00:00:00+07:00`);
  const end = new Date(`${endDate}T00:00:00+07:00`);

  const updated = await prisma.course.update({
    where: { course_id: courseId },
    data: {
      course_name: title,
      course_description: subtitle,
      enroll_code: enrollCode,
      location,
      course_status: statusRaw as any,
      start_date: start,
      end_date: end,
      image_url: imageUrl,
    },
    select: { course_id: true },
  });

  return NextResponse.json({ id: updated.course_id.toString() }, { status: 200 });
}
