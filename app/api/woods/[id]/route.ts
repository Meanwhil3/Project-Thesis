import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // ตรวจสอบ path ให้ตรงกับโปรเจกต์ของคุณ

const prisma = new PrismaClient();

/**
 * ฟังก์ชันช่วยตรวจสอบสิทธิ์ (Reusable Auth Logic)
 */
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = String((session.user as any).role ?? "").toUpperCase();
  const isAuthorized = role === "ADMIN" || role === "INSTRUCTOR";
  
  if (!isAuthorized) return null;

  const user = session.user as any;
  const rawUserId = user.id || user.user_id || user.sub;

  return {
    userId: rawUserId ? BigInt(rawUserId) : null,
    role
  };
}

// --- [GET] ดึงข้อมูลรายตัว (ให้สิทธิ์ทุกคนรวมถึง TRAINEE ดูข้อมูลได้) ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wood = await prisma.wood.findUnique({
      where: { wood_id: BigInt(id) },
      include: { images: true },
    });

    if (!wood) return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });

    const serializedWood = JSON.parse(
      JSON.stringify(wood, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    return NextResponse.json(serializedWood);
  } catch (error) {
    return NextResponse.json({ error: "Fetch Error" }, { status: 500 });
  }
}

// --- [PUT] แก้ไขข้อมูลทั้งหมด (ADMIN/INSTRUCTOR เท่านั้น) ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: "Forbidden: Unauthorized access" }, { status: 403 });

    const { id } = await params;
    const formData = await request.formData();
    const updateData: any = {};

    formData.forEach((value, key) => {
      if (!['new_images', 'existing_images', 'wood_id', 'images', 'author'].includes(key)) {
        updateData[key] = (value === "" || value === "null") ? null : value;
      }
    });

    updateData.updated_at = new Date();

    // จัดการรูปภาพเดิม
    const existingImagesStr = formData.get('existing_images') as string;
    const existingImageIds = JSON.parse(existingImagesStr || '[]').map((img: any) => BigInt(img.image_id));

    await prisma.wood_Images.deleteMany({
      where: {
        wood_id: BigInt(id),
        NOT: { image_id: { in: existingImageIds } }
      }
    });

    // จัดการรูปภาพใหม่
    const newFiles = formData.getAll('new_images') as File[];
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true }).catch(() => {});

    for (const file of newFiles) {
      const uniqueName = `${Date.now()}-${file.name}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, uniqueName), buffer);

      await prisma.wood_Images.create({
        data: {
          wood_id: BigInt(id),
          image_url: `/uploads/${uniqueName}`,
          date_added: new Date(),
        },
      });
    }

    const updatedWood = await prisma.wood.update({
      where: { wood_id: BigInt(id) },
      data: updateData,
    });

    return NextResponse.json(JSON.parse(JSON.stringify(updatedWood, (k, v) => typeof v === 'bigint' ? v.toString() : v)));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- [PATCH] แก้ไขสถานะ (ADMIN/INSTRUCTOR เท่านั้น) ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { wood_status } = await request.json();

    const updated = await prisma.wood.update({
      where: { wood_id: BigInt(id) },
      data: { wood_status, updated_at: new Date() },
    });

    return NextResponse.json({ message: "Updated status success" });
  } catch (error) {
    return NextResponse.json({ error: "Patch failed" }, { status: 500 });
  }
}

// --- [DELETE] ลบข้อมูล (ADMIN/INSTRUCTOR เท่านั้น) ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const wId = BigInt(id);

    await prisma.$transaction([
      prisma.wood_Images.deleteMany({ where: { wood_id: wId } }),
      prisma.wood.delete({ where: { wood_id: wId } })
    ]);

    return NextResponse.json({ message: "Delete success" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}