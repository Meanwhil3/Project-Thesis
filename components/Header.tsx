"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import WoodCertifyLogo from "@/components/woodlogo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";

export type HeaderUser = {
  name?: string | null;
  image?: string | null;
  role?: string | null;
};

type NavItem = {
  key: string;
  label: string;
  href: string;
};

export default function Header({
  user: userProp,
  showNav = false,
}: {
  user?: HeaderUser;
  showNav?: boolean;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ใช้ prop ถ้าส่งมา มิฉะนั้นใช้จาก session (name/role ดึงจาก DB ตอน login)
  const user: HeaderUser = userProp ?? {
    name: session?.user?.name,
    image: session?.user?.image,
    role: (session?.user as any)?.role ?? null,
  };

  const displayName = (user?.name ?? "").trim();
  const nameToShow = displayName.length > 0 ? displayName : "ผู้ใช้งาน";
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const isInstructor = (user?.role || "").toLowerCase() === "instructor";

  const navItems: NavItem[] = useMemo(() => {
    if (!showNav) return [];
    return [
      ...(isAdmin
        ? [{ key: "overview", label: "ภาพรวม", href: "/admin/dashboard" }]
        : []),
      { key: "training", label: "อบรม", href: "/admin/courses" },
      { key: "species", label: "พรรณไม้", href: "/tree/treesearch" },
      ...(isAdmin
        ? [{ key: "users", label: "ผู้ใช้งาน", href: "/users" }]
        : []),
    ];
  }, [showNav, isAdmin, isInstructor]);

  const activeKey = useMemo(() => {
    const found = navItems.find((it) => pathname?.startsWith(it.href));
    return found?.key ?? navItems[0]?.key ?? "";
  }, [navItems, pathname]);

  const initials = useMemo(() => {
    const parts = nameToShow.split(/\s+/).filter(Boolean);
    return parts
      .map((s) => s[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [nameToShow]);

  // close on outside click / esc
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  return (
  <>
  <div aria-hidden className="h-18 w-full" />
  <header className="fixed top-0 left-0 right-0 z-50">
    {/* ✅ Full-width background layer (ไม่กระทบ layout ด้านใน) */}
    <div
      aria-hidden
      className="
        pointer-events-none
        absolute inset-x-0 top-0 h-full
        w-screen left-1/2 -translate-x-1/2
        border-b border-emerald-100
        bg-gradient-to-b from-[#F1FAF0] to-white/60
        backdrop-blur supports-[backdrop-filter]:bg-white/50
      "
    />

    {/* ✅ Content stays normal, ไม่เละ */}
    <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex h-18 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <WoodCertifyLogo className="scale-80" />
          {isAdmin && (
            <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Admin
            </span>
          )}
        </Link>

        {/* Centered pill navigation */}
        {navItems.length > 0 && (
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center rounded-full border border-emerald-100 bg-white/80 p-1 backdrop-blur-sm shadow-sm">
              {navItems.map((item) => {
                const isActive = item.key === activeKey;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`
                      relative rounded-full px-6 py-2 text-[15px] font-medium
                      transition-all duration-300 ease-in-out whitespace-nowrap
                      ${
                        isActive
                          ? "bg-gradient-to-b from-[#d4edda] to-[#c3e6cb] text-[#166534] shadow-sm"
                          : "text-[#9ca3af] hover:text-[#374151] hover:bg-emerald-50/60"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span className="max-w-[180px] truncate text-sm text-[#14532D]">
              {nameToShow}
            </span>

            <Avatar className="h-8 w-8 ring-1 ring-emerald-200">
              <AvatarImage src={user?.image || ""} alt={nameToShow} />
              <AvatarFallback className="bg-emerald-100 text-emerald-800">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-lg"
            >
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-[#14532D]">
                  {nameToShow}
                </p>
                <p className="text-xs text-[#6E8E59]">
                  {user?.role
                    ? user.role.charAt(0).toUpperCase() +
                      user.role.slice(1).toLowerCase()
                    : ""}
                </p>
              </div>

              <div className="h-px bg-emerald-100" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-[#14532D] hover:bg-[#F4FBF1]"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  </>
);
}
