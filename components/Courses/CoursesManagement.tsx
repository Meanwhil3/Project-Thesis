"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SummaryCard from "@/components/Courses/SummaryCard";
import CourseCard, { type CourseItem } from "@/components/Courses/CourseCard";

import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  MapPin,
  Search,
  UserCheck,
  Users,
  FolderOpen,
  Plus,
} from "lucide-react";

export type CourseStatus = "open" | "closed";
export type CourseManagementMode = "admin" | "instructor" | "trainee";


const mockCourses: CourseItem[] = [
  {
    id: "1",
    title: "อบรมรุ่นที่ 1",
    subtitle: "อบรมพื้นฐานการพิสูจน์ไม้",
    imageUrl: "https://placehold.co/380x190",
    location: "คณะเทคโนโลยีสารสนเทศ สจล",
    startDate: "15 มี.ค 2568",
    endDate: "17 มี.ค 2568",
    enrolledCount: 10,
    status: "open",
  },
  {
    id: "2",
    title: "อบรมรุ่นที่ 2",
    subtitle: "อบรมเชิงปฏิบัติการ (ภาคสนาม)",
    imageUrl: "https://placehold.co/380x190",
    location: "ห้องประชุม A",
    startDate: "20 มี.ค 2568",
    endDate: "22 มี.ค 2568",
    enrolledCount: 24,
    status: "open",
  },
  {
    id: "3",
    title: "อบรมรุ่นที่ 3",
    subtitle: "อบรมทบทวนก่อนสอบ",
    imageUrl: "https://placehold.co/380x190",
    location: "M 03",
    startDate: "28 มี.ค 2568",
    endDate: "28 มี.ค 2568",
    enrolledCount: 16,
    status: "closed",
  },
];

export default function CourseManagement({
  title = "อบรมทั้งหมด",
  mode, // ถ้าไม่ส่งมา จะเดาจาก pathname
}: {
  title?: string;
  mode?: CourseManagementMode;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [courseList] = useState<CourseItem[]>(mockCourses);

  const resolvedMode: CourseManagementMode = useMemo(() => {
    if (mode) return mode;
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/instructor")) return "instructor";
    return "trainee";
  }, [mode, pathname]);

  const canCreateCourse =
    resolvedMode === "admin" || resolvedMode === "instructor";
  const createHref =
    resolvedMode === "admin"
      ? "/admin/courses/new"
      : resolvedMode === "instructor"
      ? "/instructor/courses/new"
      : "#";

  const totalCourses = courseList.length;
  const openCount = courseList.filter((c) => c.status === "open").length;
  const totalUsers = 127; // mock

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courseList;
    return courseList.filter((c) =>
      `${c.title} ${c.subtitle} ${c.location}`.toLowerCase().includes(q)
    );
  }, [courseList, search]);

  // const listHref =
  // resolvedMode === "admin"
  //   ? "/admin/courses"
  //   : resolvedMode === "instructor"
  //     ? "/instructor/courses"
  //     : "/admin/courses";

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
              จัดการและค้นหาอบรมในระบบได้จากหน้านี้
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
          <SummaryCard
            label="อบรมทั้งหมด"
            value={totalCourses}
            icon={GraduationCap}
            iconBg="bg-[#E8F7ED]"
            iconColor="text-[#16A34A]"
          />
          <SummaryCard
            label="ผู้ใช้งานทั้งหมด"
            value={totalUsers}
            icon={Users}
            iconBg="bg-[#EAF2FF]"
            iconColor="text-[#2563EB]"
          />
          <SummaryCard
            label="เปิดรับสมัคร"
            value={openCount}
            icon={FolderOpen}
            iconBg="bg-[#FFF7ED]"
            iconColor="text-[#EA580C]"
          />
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
            <input
              type="text"
              placeholder="ค้นหาอบรม (ชื่อ / คำอธิบาย / สถานที่)..."
              className="h-11 w-full rounded-xl border border-[#CDE3BD] bg-white pl-9 pr-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c) => (
            <CourseCard key={c.id} course={c}  />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="mt-10 rounded-2xl border border-[#CDE3BD] bg-white p-8 text-center shadow-[0_0_4px_0_#CAE0BC]/50">
            <p className="text-sm font-medium text-[#14532D]">
              ไม่พบอบรมตามเงื่อนไขที่ค้นหา
            </p>
            <p className="mt-1 text-xs text-[#6E8E59]">
              ลองปรับคำค้นหาให้สั้นลง หรือค้นด้วยชื่อสถานที่
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
