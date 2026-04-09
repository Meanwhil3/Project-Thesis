"use client";

import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function MainNavbar() {
  const { data: session } = useSession();
  const role = String((session?.user as any)?.role ?? "").toUpperCase();
  const isAdmin = role === "ADMIN";

  const items = [
    { key: "overview", label: "ภาพรวม", href: "/login" },
    { key: "training", label: "อบรม", href: "/admin/courses" },
    { key: "species", label: "พันธุ์ไม้", href: "/tree/treesearch" },
    ...(isAdmin
      ? [{ key: "users", label: "ผู้ใช้งาน", href: "/users" }]
      : []),
  ];

  return <Navbar items={items} topOffsetClassName="top-14" />;
}
