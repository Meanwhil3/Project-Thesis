"use client";

import type { ElementType } from "react";
import { ArrowUpRight, CalendarDays, MapPin, UserCheck } from "lucide-react";
import { buildGoogleMapsSearchUrl } from "@/lib/maps";
import Link from "next/link";

export type CourseStatus = "open" | "closed";

export interface CourseItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  enrolledCount: number;
  status: CourseStatus;
}

export default function CourseCard({ course }: { course: CourseItem }) {
  const isOpen = course.status === "open";
  const hasLocation = !!course.location?.trim();

  return (
    <div className="group relative w-full max-w-[380px] justify-self-center overflow-hidden rounded-[20px] bg-white shadow-[0_0_4px_0_#CAE0BC] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-18px_rgba(20,83,45,0.45)]">
      {/* Image */}
      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="h-[190px] w-full object-cover"
        />

        {/* Status badge */}
        <div className="absolute left-4 top-4">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur",
              isOpen
                ? "border-[#86EFAC] bg-[#DCFCE7]/80 text-[#14532D]"
                : "border-[#E5E7EB] bg-white/80 text-[#6B7280]",
            ].join(" ")}
          >
            <span
              className={[
                "h-2 w-2 rounded-full",
                isOpen ? "bg-[#16A34A]" : "bg-[#9CA3AF]",
              ].join(" ")}
            />
            {isOpen ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-14 pt-4 font-kanit">
        <h3 className="text-[18px] font-semibold leading-[28px] text-[#14532D]">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-[18px] text-[#6E8E59]">
          {course.subtitle}
        </p>

        <div className="mt-6 space-y-3 text-[14px] font-medium leading-[22px] text-[#111827]">
          <Row icon={UserCheck} text={`${course.enrolledCount} คนลงทะเบียน`} />
          <Row
            icon={CalendarDays}
            text={`${course.startDate} - ${course.endDate}`}
          />

          {/* Location row + maps link (no API key required) */}
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#16A34A] ring-1 ring-black/5">
              <MapPin className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[#111827]">
                  {course.location}
                </span>

                {hasLocation && (
                  <a
                    href={buildGoogleMapsSearchUrl(course.location)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#CDE3BD] bg-white px-2.5 py-1 text-xs font-semibold text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/40 transition hover:bg-[#F6FBF6]"
                    aria-label={`เปิดสถานที่ ${course.location} ใน Google Maps`}
                    title="เปิดใน Google Maps"
                  >
                    แผนที่
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={`/courses/${course.id}`}
        className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#14532D]/70 bg-white text-[#14532D] shadow-sm transition hover:bg-[#14532D] hover:text-white active:scale-95"
        aria-label="รายละเอียดอบรม"
      >
        <ArrowUpRight className="h-[18px] w-[18px]" />
      </Link>

      {/* hover hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-[#DCFCE7] via-[#CDE3BD] to-transparent opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}

function Row({ icon: Icon, text }: { icon: ElementType; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#16A34A] ring-1 ring-black/5">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[#111827]">{text}</span>
    </div>
  );
}