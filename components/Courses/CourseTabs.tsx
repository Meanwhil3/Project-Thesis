"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { label: string; href: string; exact?: boolean };

export default function CourseTabs({ courseId, role }: { courseId: string; role?: string }) {
  const pathname = usePathname();
  const base = `/courses/${courseId}`;

  const isAdmin = role === "ADMIN";
  const isTrainee = role === "TRAINEE";

  const tabs: Tab[] = [
    { label: "ภาพรวม", href: base, exact: true },
    { label: "เนื้อหา", href: `${base}/lessons` },
    { label: "สอบ", href: `${base}/exams` },
    ...(isAdmin ? [{ label: "สมาชิก", href: `${base}/members` }] : []),
    ...(isTrainee ? [{ label: "คะแนน", href: `${base}/scores` }] : []),
  ];

  const isActive = (t: Tab) => (t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`));

  return (
    <div className="mt-7">
      <div className="rounded-2xl bg-white/80 p-2 shadow-[0_0_6px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur">
        <div className="flex items-center gap-0">
          {tabs.map((t, i) => {
            const active = isActive(t);
            return (
              <div key={t.href} className="flex flex-1 items-center">
                {i > 0 && (
                  <div className="h-5 w-px shrink-0 bg-gray-300" />
                )}
                <Link
                  href={t.href}
                  className={[
                    "mx-1 h-11 flex-1 rounded-xl font-kanit text-[15px] flex items-center justify-center transition",
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
