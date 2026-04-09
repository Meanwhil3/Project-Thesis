import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const user = await prisma.user.findUnique({
      where: { user_id: BigInt(userId) },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        role: { select: { name: true } },
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role?.name ?? null,
      created_at: user.created_at?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("Profile error:", err);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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
    const { first_name, last_name } = body;

    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json(
        { message: "กรุณากรอกชื่อและนามสกุล" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { user_id: BigInt(userId) },
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
      },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        role: { select: { name: true } },
        created_at: true,
      },
    });

    return NextResponse.json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role?.name ?? null,
      created_at: user.created_at?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
