//components/CoursesManagement.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SummaryCard from "@/components/Courses/SummaryCard";
import CourseCard, { type CourseItem } from "@/components/Courses/CourseCard";

import { GraduationCap, Search, Users, FolderOpen, Plus } from "lucide-react";

export type CourseManagementMode = "admin" | "instructor" | "trainee";

// trainee → ดูคอร์สทั้งหมด (OPEN) พร้อม enrolled flag
// admin / instructor → endpoint ของตัวเอง
const API_ENDPOINT: Record<CourseManagementMode, string> = {
  admin: "/api/admin/courses",
  instructor: "/api/instructor/courses",
  trainee: "/api/courses",
};

export default function CourseManagement({
  title = "อบรมทั้งหมด",
  mode,
}: {
  title?: string;
  mode?: CourseManagementMode;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [courseList, setCourseList] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const resolvedMode: CourseManagementMode = useMemo(() => {
    if (mode) return mode;
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/instructor")) return "instructor";
    return "trainee";
  }, [mode, pathname]);

  const { data: session } = useSession();
  const userRole = String((session?.user as any)?.role ?? "").toUpperCase();
  const canCreateCourse =
    (resolvedMode === "admin" || resolvedMode === "instructor") && userRole !== "TRAINEE";
  const createHref =
    resolvedMode === "admin"
      ? "/admin/courses/new"
      : resolvedMode === "instructor"
        ? "/instructor/courses/new"
        : "#";

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = API_ENDPOINT[resolvedMode];

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchCourses = fetch(endpoint, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        // ดึงจำนวนผู้ใช้งานจริง (เฉพาะ admin / instructor)
        const fetchUsers =
          resolvedMode !== "trainee"
            ? fetch("/api/admin/users/count", {
                cache: "no-store",
                signal: controller.signal,
              })
            : null;

        const [coursesRes, usersRes] = await Promise.all([
          fetchCourses,
          fetchUsers,
        ]);

        if (!coursesRes.ok) {
          const msg = await coursesRes.text().catch(() => "");
          throw new Error(msg || "โหลดข้อมูลคอร์สไม่สำเร็จ");
        }

        const data = (await coursesRes.json()) as CourseItem[];
        setCourseList(Array.isArray(data) ? data : []);

        if (usersRes?.ok) {
          const usersData = await usersRes.json();
          setTotalUsers(usersData.count ?? 0);
        }
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลคอร์สไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [resolvedMode]);

  const totalCourses = courseList.length;
  const openCount = courseList.filter((c) => c.status === "open").length;
  const enrolledCount = courseList.filter((c) => c.enrolled).length;

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courseList;
    return courseList.filter((c) =>
      `${c.title} ${c.subtitle} ${c.location}`.toLowerCase().includes(q)
    );
  }, [courseList, search]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#14532D]">
              {title}
            </h1>
            <p className="text-sm text-[#6E8E59]">
              {resolvedMode === "trainee"
                ? "ลงทะเบียนคอร์สที่สนใจเพื่อเข้าถึงบทเรียนและข้อสอบ"
                : "จัดการและค้นหาอบรมในระบบได้จากหน้านี้"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canCreateCourse && (
              <Link
                href={createHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#14532D] px-4 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition hover:bg-[#0F3F22] active:scale-[0.99]"
              >
                <Plus className="h-4 w-4" />
                เพิ่มคอร์ส
              </Link>
            )}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#CDE3BD] bg-white px-3 py-1 text-xs text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/60">
              <FolderOpen className="h-4 w-4 text-[#16A34A]" />
              <span>ทั้งหมด {totalCourses} รายการ</span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {resolvedMode === "trainee" ? (
            <>
              <SummaryCard label="คอร์สทั้งหมด" value={totalCourses} icon={GraduationCap} iconBg="bg-[#E8F7ED]" iconColor="text-[#16A34A]" />
              <SummaryCard label="ลงทะเบียนแล้ว" value={enrolledCount} icon={Users} iconBg="bg-[#EAF2FF]" iconColor="text-[#2563EB]" />
              <SummaryCard label="เปิดรับสมัคร" value={openCount} icon={FolderOpen} iconBg="bg-[#FFF7ED]" iconColor="text-[#EA580C]" />
            </>
          ) : (
            <>
              <SummaryCard label="อบรมทั้งหมด" value={totalCourses} icon={GraduationCap} iconBg="bg-[#E8F7ED]" iconColor="text-[#16A34A]" />
              <SummaryCard label="ผู้ใช้งานทั้งหมด" value={totalUsers} icon={Users} iconBg="bg-[#EAF2FF]" iconColor="text-[#2563EB]" />
              <SummaryCard label="เปิดรับสมัคร" value={openCount} icon={FolderOpen} iconBg="bg-[#FFF7ED]" iconColor="text-[#EA580C]" />
            </>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
            <input
              type="text"
              placeholder="ค้นหาอบรม (ชื่อ / คำอธิบาย / สถานที่)..."
              className="h-11 w-full rounded-xl border border-[#CDE3BD] bg-white pl-9 pr-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-700 shadow-[0_0_4px_0_#CAE0BC]/50">
            โหลดข้อมูลไม่สำเร็จ: {error}
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[360px] w-full max-w-[380px] justify-self-center overflow-hidden rounded-[20px] border border-[#E6F1DF] bg-white shadow-[0_0_4px_0_#CAE0BC]/50">
                  <div className="h-[190px] w-full animate-pulse bg-[#F6FBF6]" />
                  <div className="p-5">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#F6FBF6]" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-[#F6FBF6]" />
                    <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-[#F6FBF6]" />
                    <div className="mt-6 space-y-3">
                      <div className="h-3 w-1/2 animate-pulse rounded bg-[#F6FBF6]" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-[#F6FBF6]" />
                      <div className="h-3 w-3/5 animate-pulse rounded bg-[#F6FBF6]" />
                    </div>
                  </div>
                </div>
              ))
            : filteredCourses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="mt-10 rounded-2xl border border-[#CDE3BD] bg-white p-8 text-center shadow-[0_0_4px_0_#CAE0BC]/50">
            <p className="text-sm font-medium text-[#14532D]">ไม่พบอบรมตามเงื่อนไขที่ค้นหา</p>
            <p className="mt-1 text-xs text-[#6E8E59]">ลองปรับคำค้นหาให้สั้นลง หรือค้นด้วยชื่อสถานที่</p>
          </div>
        )}
      </main>
    </div>
  );
}