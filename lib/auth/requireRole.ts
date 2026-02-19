// lib/auth/requireRole.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth"; // ✅ ปรับ path ให้ตรงโปรเจกต์คุณ
import { getRoleFromSession, isAllowedRole, type AppRole } from "./roles";

export async function requireRole(allowed: AppRole[]) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = getRoleFromSession(session);
  if (!isAllowedRole(role, allowed)) redirect("/forbidden");

  return { session, role };
}
