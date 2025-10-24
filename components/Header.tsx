"use client";
import Link from "next/link";
import WoodCertifyLogo from "@/components/woodlogo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { de } from "zod/locales";

/**
 * WoodCertify header bar
 * - Left: Logo + brand text (uses your <WoodCertifyLogo /> component)
 * - Optional role pill (shows when user.role === "admin")
 * - Right: current user's name + avatar (image fallback to initials)
 *
 * Usage (server or client):
 *   <Header user={{ name: session?.user?.name, image: session?.user?.image, role: session?.user?.role }} />
 */
export type HeaderUser = {
  name?: string | null;
  image?: string | null;
  role?: string | null; // e.g., "admin", "officer", "trainee"
};

export default function Header({ user }: { user?: HeaderUser }) {
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const initials = (user?.name || "ผู้ใช้งาน")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-gradient-to-b from-[#F1FAF0] to-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand */}
          <Link href="/" className="group flex items-center gap-2">
            <WoodCertifyLogo className="scale-80"/>
            {isAdmin && (
              <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Admin
              </span>
            )}
          </Link>

          {/* Right: User name + avatar */}
          <div className="flex items-center gap-3">
            <span className="max-w-[160px] truncate text-sm">
              {user?.name || "ผู้ใช้งาน"}
            </span>
            <Avatar className="h-8 w-8 ring-1 ring-emerald-200">
              <AvatarImage src={user?.image || ""} alt={user?.name || "profile"} />
              <AvatarFallback className="bg-emerald-100 text-emerald-800">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
