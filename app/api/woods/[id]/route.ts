import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// --- [GET] ดึงข้อมูลรายตัว ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wood = await prisma.wood.findUnique({
      where: { wood_id: BigInt(id) },
      include: { images: true }, // ดึงข้อมูลจาก Wood_Images มาด้วย
    });

    if (!wood) {
      return NextResponse.json({ error: "ไม่พบข้อมูลพันธุ์ไม้" }, { status: 404 });
    }

    const serializedWood = JSON.parse(
      JSON.stringify(wood, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    return NextResponse.json(serializedWood, { status: 200 });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

// --- [PUT] แก้ไขข้อมูลทั้งหมดพร้อมจัดการรูปภาพ ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    // 1. จัดการข้อมูล Text สำหรับอัปเดตตาราง Wood
    const updateData: any = {};
    formData.forEach((value, key) => {
      // ข้ามฟิลด์ที่ไม่ใช่ข้อมูลในตาราง Wood
      if (!['new_images', 'existing_images', 'wood_id', 'images', 'author'].includes(key)) {
        // ถ้าเป็นค่าว่างให้เซ็ตเป็น null เพื่อรองรับ Enum/Optional fields ใน Prisma
        updateData[key] = (value === "" || value === "null") ? null : value;
      }
    });

    // อัปเดตเวลาแก้ไข
    updateData.updated_at = new Date();

    // 2. จัดการรูปภาพเดิม (ลบรูปที่ไม่ได้ส่งกลับมาใน existing_images)
    const existingImagesStr = formData.get('existing_images') as string;
    const existingImages = JSON.parse(existingImagesStr || '[]');
    const existingImageIds = existingImages.map((img: any) => BigInt(img.image_id));

    await prisma.wood_Images.deleteMany({
      where: {
        wood_id: BigInt(id),
        NOT: {
          image_id: { in: existingImageIds }
        }
      }
    });

    // 3. จัดการอัปโหลดรูปภาพใหม่
    const newFiles = formData.getAll('new_images') as File[];
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // สร้างโฟลเดอร์เก็บไฟล์หากยังไม่มี
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

    for (const file of newFiles) {
      const uniqueName = `${Date.now()}-${file.name}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, uniqueName), buffer);

      // บันทึก Path ลงตาราง Wood_Images
      await prisma.wood_Images.create({
        data: {
          wood_id: BigInt(id),
          image_url: `/uploads/${uniqueName}`,
          date_added: new Date(),
        },
      });
    }

    // 4. บันทึกข้อมูลรายละเอียดไม้ลงตารางหลัก
    const updatedWood = await prisma.wood.update({
      where: { wood_id: BigInt(id) },
      data: updateData,
      include: { images: true }
    });

    const serializedWood = JSON.parse(
      JSON.stringify(updatedWood, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serializedWood, { status: 200 });
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกข้อมูลได้: " + error.message }, { status: 500 });
  }
}

// --- [PATCH] แก้ไขสถานะ SHOW/HIDE ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedWood = await prisma.wood.update({
      where: { wood_id: BigInt(id) },
      data: {
        wood_status: body.wood_status,
        updated_at: new Date(),
      },
    });

    const serializedWood = JSON.parse(
      JSON.stringify(updatedWood, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    return NextResponse.json(serializedWood, { status: 200 });
  } catch (error: any) {
    console.error("Patch Error:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข้อมูลได้" }, { status: 500 });
  }
}

// --- [DELETE] ลบข้อมูล ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // ลบรูปภาพที่เกี่ยวข้องก่อน (ถ้าไม่ได้ตั้ง Cascade ใน DB)
    await prisma.wood_Images.deleteMany({
      where: { wood_id: BigInt(id) }
    });

    await prisma.wood.delete({
      where: { wood_id: BigInt(id) },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบข้อมูลได้" }, { status: 500 });
  }
}