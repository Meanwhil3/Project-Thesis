import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 1. เปลี่ยน params ให้เป็น Promise
) {
  try {
    // 2. ใช้ await เพื่อดึงค่า id ออกมาจาก params ตามกฎใหม่ของ Next.js 15
    const { id } = await params;

    // 3. ตรวจสอบว่า id มีค่าหรือไม่
    if (!id) {
      return NextResponse.json({ error: "ระบุ ID ไม่ถูกต้อง" }, { status: 400 });
    }

    // 4. สั่งลบข้อมูลใน Database
    await prisma.wood.delete({
      where: {
        wood_id: BigInt(id), // แปลง ID เป็น BigInt ตาม Schema
      },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete Error:", error);

    // กรณีหา ID ไม่เจอ Prisma จะพ่น error code P2025
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "ไม่พบข้อมูลที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "ไม่สามารถลบข้อมูลได้เนื่องจากข้อผิดพลาดภายใน" },
      { status: 500 }
    );
  }
}