import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      created_at: true,
      is_active: true, // 1/0 หรือ boolean ตาม schema
      role: true,      // ถ้าเป็น string enum เช่น "ADMIN" / "EXAMINER" / "TRAINEE"
    },
  });

  const data = users.map((u) => ({
    id: u.id,
    fullName: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
    email: u.email,
    joinedAt: new Date(u.created_at).toLocaleDateString("th-TH"),
    role: normalizeRole(u.role),
    status: normalizeStatus(u.is_active),
  }));

  return NextResponse.json({ data });
}

function normalizeStatus(isActive: any): "active" | "blocked" {
  // รองรับทั้ง boolean และ 1/0
  const v = typeof isActive === "boolean" ? isActive : Number(isActive) === 1;
  return v ? "active" : "blocked";
}

function normalizeRole(role: any): "admin" | "examiner" | "trainee" {
  const r = String(role ?? "").toLowerCase();
  if (r.includes("admin")) return "admin";
  if (r.includes("exam")) return "examiner";
  return "trainee";
}
