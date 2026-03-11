"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

function isSafeInternalPath(p: string) {
  return p.startsWith("/") && !p.startsWith("//") && !p.includes("://");
}

const defaultClassName =
  "inline-flex items-center gap-2 rounded-xl px-2 py-1 font-kanit text-[22px] font-medium text-[#14532D] transition hover:bg-white/70 active:scale-[0.99]";

/**
 * เมื่อส่ง href มาตรง ๆ → ใช้ Link ธรรมดา ไม่ต้อง useSearchParams
 * เมื่อไม่ส่ง href → ใช้ InnerBackButton ที่อ่าน searchParams (ต้องอยู่ใน Suspense)
 */
export default function BackButton({ href, label = "อบรมทั้งหมด", className }: BackButtonProps) {
  if (href?.trim()) {
    return (
      <Link href={href.trim()} className={className ?? defaultClassName} aria-label="ย้อนกลับ">
        <ArrowLeft className="h-6 w-6" />
        {label}
      </Link>
    );
  }

  return (
    <Suspense
      fallback={
        <span className={className ?? defaultClassName} aria-label="ย้อนกลับ">
          <ArrowLeft className="h-6 w-6" />
          {label}
        </span>
      }
    >
      <InnerBackButton label={label} className={className} />
    </Suspense>
  );
}

function InnerBackButton({ label, className }: { label: string; className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedHref = useMemo(() => {
    const from = searchParams.get("from")?.trim();
    if (from && isSafeInternalPath(from)) return from;

    if (pathname.startsWith("/admin")) return "/admin/courses";
    if (pathname.startsWith("/instructor")) return "/admin/courses";
    return "/admin/courses";
  }, [pathname, searchParams]);

  return (
    <Link href={resolvedHref} className={className ?? defaultClassName} aria-label="ย้อนกลับ">
      <ArrowLeft className="h-6 w-6" />
      {label}
    </Link>
  );
}
