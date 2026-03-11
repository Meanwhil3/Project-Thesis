import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UiRole = "admin" | "instructor" | "trainee";
type UiStatus = "active" | "blocked";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { deleted_at: null },
    orderBy: [{ created_at: "desc" }, { user_id: "desc" }],
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      email: true,
      is_active: true,
      created_at: true,
      role: { select: { name: true } },
    },
  });

  const data = users.map((u) => ({
    id: u.user_id.toString(), // ✅ BigInt -> string
    fullName: `${u.first_name} ${u.last_name}`.trim(),
    email: u.email,
    joinedAt: formatTHDate(u.created_at),
    role: normalizeRole(u.role?.name),
    status: (u.is_active ?? false) ? ("active" as UiStatus) : ("blocked" as UiStatus),
  }));

  return NextResponse.json({ data });
}

function formatTHDate(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("th-TH");
}

function normalizeRole(name?: string | null): UiRole {
  const r = String(name ?? "").toLowerCase();
  // รองรับชื่อ role ได้ทั้งไทย/อังกฤษ
  if (r.includes("admin") || r.includes("ผู้ดูแล")) return "admin";
  if (r.includes("instructor") || r.includes("examiner") || r.includes("ผู้สอน")) return "instructor";
  return "trainee";
}
