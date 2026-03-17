import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).user_id;
    if (!userId) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body ?? {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { user_id: BigInt(userId) },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(
      String(currentPassword),
      String(user.password)
    );

    if (!isMatch) {
      return NextResponse.json(
        { message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);

    await prisma.user.update({
      where: { user_id: BigInt(userId) },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
