// /api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UiRole = "admin" | "instructor" | "trainee";
type UiStatus = "active" | "blocked";

const ROLE_NAME_MAP: Record<UiRole, string[]> = {
  admin: ["ADMIN"],
  instructor: ["INSTRUCTOR", "EXAMINER"],
  trainee: ["TRAINEE"],
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  let userId: bigint;
  try {
    userId = BigInt(params.id);
  } catch {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as Partial<{
    fullName: string;
    role: UiRole;
    status: UiStatus;
  }> | null;

  if (!body) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

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
    if (body.status !== "active" && body.status !== "blocked") {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    data.is_active = body.status === "active";
  }

  if (typeof body.role === "string") {
    if (
      body.role !== "admin" &&
      body.role !== "instructor" &&
      body.role !== "trainee"
    ) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const roleNames = ROLE_NAME_MAP[body.role];
    const role = await prisma.role.findFirst({
      where: { name: { in: roleNames } },
      select: { role_id: true },
    });

    if (!role) {
      return NextResponse.json(
        {
          message: `Role '${roleNames.join("/")}' not found in DB. Please seed Role table.`,
        },
        { status: 400 }
      );
    }

    data.role_id = role.role_id;
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
  let userId: bigint;
  try {
    userId = BigInt(params.id);
  } catch {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  await prisma.user.update({
    where: { user_id: userId },
    data: { deleted_at: new Date() },
  });

  return NextResponse.json({ ok: true });
}
