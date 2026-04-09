"use client";

import type { ElementType } from "react";
import { ArrowUpRight, CalendarDays, MapPin, UserCheck } from "lucide-react";
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
  enrolled?: boolean; // true = TRAINEE ลงทะเบียนแล้ว
}

function buildGoogleMapsSearchUrl(query: string) {
  const q = query.trim();
  if (!q) return "https://www.google.com/maps";
  const params = new URLSearchParams({ api: "1", query: q });
  return `https://www.google.com/maps/search/?${params.toString()}`;
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

        {/* Enrolled badge */}
        {course.enrolled !== undefined && (
          <div className="absolute right-4 top-4">
            {course.enrolled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#86EFAC] bg-[#DCFCE7]/90 px-2.5 py-1 text-xs font-medium text-[#14532D] shadow-sm backdrop-blur">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                ลงทะเบียนแล้ว
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-xs font-medium text-[#6B7280] shadow-sm backdrop-blur">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                ยังไม่ได้ลงทะเบียน
              </span>
            )}
          </div>
        )}
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