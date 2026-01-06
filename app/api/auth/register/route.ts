import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, password } = body ?? {};

    // basic validation
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const plainPassword = String(password);

    if (plainPassword.length < 6) {
      return NextResponse.json(
        { message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    // check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { user_id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    // hash password
    const hashed = await bcrypt.hash(plainPassword, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        first_name: String(first_name).trim(),
        last_name: String(last_name).trim(),
        email: normalizedEmail,
        password: hashed,
        // คุณตั้ง default ไว้ false ใน schema
        // ถ้าต้องการ "สมัครแล้วเข้าได้ทันที" ให้เปลี่ยนเป็น true
        is_active: true,
        // created_at ถ้า DB ไม่ auto ใส่ให้ ให้เปิดใช้บรรทัดนี้
        // created_at: new Date(),
      },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
      },
    });

    return NextResponse.json(
      {
        message: "Register success",
        user: {
          user_id: user.user_id.toString(), // BigInt -> string สำหรับฝั่ง client
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_active: user.is_active,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
