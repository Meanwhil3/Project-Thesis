"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

function isSafeInternalPath(p: string) {
  // กัน open redirect / external url
  return p.startsWith("/") && !p.startsWith("//") && !p.includes("://");
}

export default function BackButton({
  href,
  label = "อบรมทั้งหมด",
  className,
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedHref = useMemo(() => {
    // 1) ถ้าส่ง href มาเอง ให้ชนะสุด
    if (href?.trim()) return href.trim();

    // 2) ถ้ามี ?from= ให้ใช้ก่อน (แก้ปัญหาการ์ดบางใบพาไปคนละ route)
    const from = searchParams.get("from")?.trim();
    if (from && isSafeInternalPath(from)) return from;

    // 3) fallback เดิม
    if (pathname.startsWith("/admin")) return "/admin/courses";
    if (pathname.startsWith("/instructor")) return "/admin/courses";
    return "/admin/courses";
  }, [href, pathname, searchParams]);

  return (
    <button
      type="button"
      onClick={() => router.push(resolvedHref)}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-xl px-2 py-1 font-kanit text-[22px] font-medium text-[#14532D] transition hover:bg-white/70 active:scale-[0.99]"
      }
      aria-label="ย้อนกลับ"
    >
      <ArrowLeft className="h-6 w-6" />
      {label}
    </button>
  );
}
