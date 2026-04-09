"use client";

import type { ElementType } from "react";

export default function SummaryCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white px-7 py-6 shadow-[0_0_4px_0_#CAE0BC]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#DCFCE7]/35 blur-2xl" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6E8E59]">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#14532D]">
            {value}
          </p>
        </div>

        <div
          className={[
            "flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-black/5 transition group-hover:scale-[1.02]",
            iconBg,
          ].join(" ")}
        >
          <Icon className={["h-7 w-7", iconColor].join(" ")} />
        </div>
      </div>
    </div>
  );
}
