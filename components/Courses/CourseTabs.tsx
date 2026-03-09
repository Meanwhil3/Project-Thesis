"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { label: string; href: string; exact?: boolean };

export default function CourseTabs({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const base = `/courses/${courseId}`;

  const tabs: Tab[] = [
    { label: "ภาพรวม", href: base, exact: true },
    { label: "เนื้อหา", href: `${base}/lessons` },
    { label: "สอบ", href: `${base}/exams` },
    { label: "สมาชิก", href: `${base}/members` },
  ];

  const isActive = (t: Tab) => (t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`));

  return (
    <div className="mt-7">
      <div className="rounded-2xl bg-white/80 p-2 shadow-[0_0_6px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((t, i) => {
            const active = isActive(t);
            return (
              <div key={t.href} className="relative flex items-center">
                {i > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-px bg-gray-300" />
                )}
                <Link
                  href={t.href}
                  className={[
                    "h-11 w-full rounded-xl font-kanit text-[15px] flex items-center justify-center transition",
                    active
                      ? "bg-[#F0FDF4] text-[#1C803D] shadow-[0_6px_18px_-12px_rgba(20,83,45,0.65)] ring-1 ring-[#BBF7D0]"
                      : "text-[#7B7B7B] hover:bg-[#F6FBF6]",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
