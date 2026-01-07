import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UiRole = "admin" | "examiner" | "trainee";
type UiStatus = "active" | "blocked";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = BigInt(params.id);
  const body = (await req.json()) as Partial<{
    fullName: string;
    role: UiRole;
    status: UiStatus;
  }>;

  const data: {
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    role_id?: bigint | null;
  } = {};

  if (typeof body.fullName === "string") {
    const parts = body.fullName.trim().split(/\s+/);
    data.first_name = parts.shift() ?? "";
    data.last_name = parts.join(" ");
  }

  if (typeof body.status === "string") {
    data.is_active = body.status === "active";
  }

  if (typeof body.role === "string") {
    data.role_id = await resolveRoleId(body.role);
  }

  await prisma.user.update({
    where: { user_id: userId },
    data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const userId = BigInt(params.id);

  // ✅ Soft delete ตาม schema
  await prisma.user.update({
    where: { user_id: userId },
    data: { deleted_at: new Date() },
  });

  return NextResponse.json({ ok: true });
}

async function resolveRoleId(role: UiRole): Promise<bigint> {
  // ปรับ mapping ตามค่า Role.name ใน DB ของคุณ
  const candidates =
    role === "admin"
      ? ["ADMIN", "admin", "ผู้ดูแล", "ผู้ดูแลระบบ"]
      : role === "examiner"
      ? ["EXAMINER", "examiner", "ผู้สอบ"]
      : ["TRAINEE", "trainee", "ผู้อบรม"];

  const found = await prisma.role.findFirst({
    where: {
      OR: candidates.map((name) => ({
        name: { equals: name, mode: "insensitive" as const },
      })),
    },
    select: { role_id: true },
  });

  if (!found) {
    // อย่าเงียบ ให้รู้ว่า DB ไม่มี role นี้จริง
    throw new Error(`Role not found for UI role: ${role}`);
  }

  return found.role_id;
}
