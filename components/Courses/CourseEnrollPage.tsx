"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyhole,
  Info,
  Users,
  MapPin,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import BackButton from "@/components/Courses/BackButton";

type Props = {
  courseId: string;
  courseName: string;
  courseDescription: string;
  courseLocation: string;
  courseBannerUrl: string;
  startDate: string;
  endDate: string;
  membersCount: number;
  courseClosed: boolean;
};

/* ── SectionShell (เหมือนหน้า overview) ────────────────────────────── */
function SectionShell({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white/85 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-7 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
            <Icon className="h-6 w-6 text-[#14532D]" />
          </div>
          <h2 className="font-kanit text-[22px] font-medium text-[#14532D] sm:text-[24px]">
            {title}
          </h2>
        </div>
      </div>
      <div className="px-7 pb-7 sm:px-8">{children}</div>
    </section>
  );
}

function buildGoogleMapsUrl(query: string) {
  const q = query.trim();
  if (!q) return "https://www.google.com/maps";
  const params = new URLSearchParams({ api: "1", query: q });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export default function CourseEnrollPage({
  courseId,
  courseName,
  courseDescription,
  courseLocation,
  courseBannerUrl,
  startDate,
  endDate,
  membersCount,
  courseClosed,
}: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit() {
    if (!code.trim()) {
      setErrorMsg("กรุณากรอกรหัสลงทะเบียน");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enroll_code: code.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setState("success");
        setTimeout(() => {
          router.refresh();
        }, 1200);
      } else {
        setErrorMsg(data?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setState("error");
      }
    } catch {
      setErrorMsg("เครือข่ายมีปัญหา กรุณาลองใหม่");
      setState("error");
    }
  }

  return (
    <div>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Back */}
        <div className="mb-6">
          <BackButton href="/courses" />
        </div>

        {/* Banner — เหมือนหน้า overview */}
        <section className="relative overflow-hidden rounded-3xl shadow-[0_10px_40px_-26px_rgba(20,83,45,0.55)] ring-1 ring-black/5">
          <img
            src={courseBannerUrl}
            alt={courseName}
            className="h-[240px] w-full object-cover sm:h-[260px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_220px_at_30%_80%,rgba(0,0,0,0.35),transparent_60%)]" />
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 sm:left-10 sm:right-10">
            <div className="max-w-3xl font-kanit">
              <div className="text-[26px] font-medium text-white drop-shadow sm:text-[38px]">
                {courseName}
              </div>
            </div>
          </div>
        </section>

        {/* Enrollment Section */}
        <div className="mt-7">
          <SectionShell title="ลงทะเบียนเข้าคอร์ส" icon={LockKeyhole}>
            {courseClosed ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <LockKeyhole className="h-7 w-7 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    ปิดรับสมัครแล้ว
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    คอร์สนี้ไม่เปิดรับสมัครในขณะนี้
                  </div>
                </div>
              </div>
            ) : state === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    className="h-7 w-7 text-emerald-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#14532D]">
                    ลงทะเบียนสำเร็จ!
                  </div>
                  <div className="mt-1 text-xs text-[#14532D]/60">
                    กำลังเข้าสู่หน้าคอร์ส...
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-md">
                <p className="mb-4 text-sm text-[#6E8E59]">
                  กรอกรหัสลงทะเบียนเพื่อเข้าถึงเนื้อหาและข้อสอบในคอร์สนี้
                </p>
                <label className="block text-sm font-medium text-[#14532D]">
                  รหัสลงทะเบียน
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="กรอกรหัส..."
                  maxLength={100}
                  className={`mt-2 h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2 ${
                    state === "error"
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-black/15 focus:border-[#4CA771] focus:ring-[#4CA771]/20"
                  }`}
                />
                {state === "error" && errorMsg && (
                  <p className="mt-1.5 text-xs text-red-600">{errorMsg}</p>
                )}
                <p className="mt-2 text-xs text-[#14532D]/50">
                  ขอรหัสได้จากผู้สอนหรือผู้ดูแลระบบ
                </p>

                <button
                  onClick={handleSubmit}
                  disabled={state === "loading"}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14532D] text-sm font-medium text-white shadow-sm transition hover:bg-[#166534] active:scale-[0.98] disabled:opacity-60"
                >
                  {state === "loading" ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      กำลังลงทะเบียน...
                    </>
                  ) : (
                    "ยืนยันลงทะเบียน"
                  )}
                </button>
              </div>
            )}
          </SectionShell>
        </div>

        {/* 2 columns — เหมือนหน้า overview */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* รายละเอียดอบรม */}
          <SectionShell title="รายละเอียดอบรม" icon={Info}>
            <div className="text-[15px] leading-7 text-[#14532D]">
              <div className="rounded-2xl bg-[#F8FFF9] p-5 ring-1 ring-[#BBF7D0]/70 whitespace-pre-wrap">
                {courseDescription || "ยังไม่มีคำอธิบายคอร์ส"}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#CDE3BD] bg-white p-5">
                {/* สถานที่ */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCFCE7] ring-1 ring-black/5">
                    <MapPin className="h-5 w-5 text-[#14532D]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-[#14532D]">
                      สถานที่จัดอบรม
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#0C6E30]">
                        {courseLocation || "—"}
                      </span>
                      {courseLocation && (
                        <a
                          href={buildGoogleMapsUrl(courseLocation)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[#CDE3BD] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#14532D] shadow-[0_0_4px_#CAE0BC]/40 transition hover:bg-[#F6FBF6]"
                        >
                          เปิดในแผนที่
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* วันที่ */}
                {(startDate || endDate) && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCFCE7] ring-1 ring-black/5">
                      <CalendarDays className="h-5 w-5 text-[#14532D]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium text-[#14532D]">
                        วันที่จัดอบรม
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#0C6E30]">
                        {startDate}
                        {endDate ? ` - ${endDate}` : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionShell>

          {/* ข้อมูลคอร์ส */}
          <SectionShell title="ข้อมูลคอร์ส" icon={Users}>
            <div className="grid gap-3">
              <div className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[16px] font-semibold text-[#14532D] ring-1 ring-black/10">
                  <Users className="h-6 w-6" />
                </div>
                <div className="min-w-0 font-kanit">
                  <div className="text-[14px] font-medium text-[#3A532D]">
                    สมาชิกที่ลงทะเบียนแล้ว
                  </div>
                  <div className="text-[20px] font-semibold text-[#14532D]">
                    {membersCount} คน
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F8FFF9] p-4 text-[12px] text-[#6E8E59] ring-1 ring-[#BBF7D0]/60">
              * ลงทะเบียนเข้าคอร์สเพื่อเข้าถึงบทเรียน ข้อสอบ
              และประกาศต่าง ๆ ของคอร์สนี้
            </div>
          </SectionShell>
        </div>
      </main>
    </div>
  );
}
