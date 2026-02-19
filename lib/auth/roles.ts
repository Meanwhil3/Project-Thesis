// lib/auth/roles.ts
export type AppRole = "ADMIN" | "EXAMINER" | "TRAINEE";

export function isAllowedRole(role: AppRole | null | undefined, allowed: AppRole[]) {
  return !!role && allowed.includes(role);
}

/**
 * ปรับให้ตรงกับ session ของโปรเจกต์คุณ:
 * - แบบที่ 1: session.user.role = "TRAINEE"
 * - แบบที่ 2: session.user.roles = ["TRAINEE", ...]
 */
export function getRoleFromSession(session: any): AppRole | null {
  const role = session?.user?.role;
  if (role) return role as AppRole;

  const roles: unknown = session?.user?.roles;
  if (Array.isArray(roles) && roles.length > 0) return roles[0] as AppRole;

  return null;
}
