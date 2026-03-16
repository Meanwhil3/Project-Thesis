"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  BookOpen,
  Users,
  TreePine,
  ClipboardCheck,
  GraduationCap,
  FileText,
  UserCheck,
  TrendingUp,
  Loader2,
  ArrowRight,
  Scale,
} from "lucide-react";

type DashboardData = {
  stats: {
    totalCourses: number;
    openCourses: number;
    totalUsers: number;
    totalWoods: number;
    totalExams: number;
    totalLessons: number;
    totalEnrollments: number;
    totalAttempts: number;
    completedAttempts: number;
  };
  userRoleCounts: { role: string; count: number }[];
  recentCourses: {
    course_id: string;
    course_name: string;
    course_status: string;
    created_at: string;
    _count: { enrollments: number; lessons: number; exams: number };
  }[];
  recentAttempts: {
    attempt_id: string;
    total_score: number;
    submit_datetime: string;
    user: { first_name: string; last_name: string };
    exam: { exam_title: string };
  }[];
  woodsByWeight: { weight: string; count: number }[];
};

const WEIGHT_LABEL: Record<string, string> = {
  LIGHT: "เบา (Light)",
  MEDIUM: "กลาง (Medium)",
  HEAVY: "หนัก (Heavy)",
};

const WEIGHT_COLOR: Record<string, string> = {
  LIGHT: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HEAVY: "bg-red-100 text-red-700",
};

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateTime(iso: string) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-red-500">ไม่สามารถโหลดข้อมูลได้</p>
        </main>
      </div>
    );
  }

  const { stats } = data;
  const examPassRate =
    stats.totalAttempts > 0
      ? Math.round((stats.completedAttempts / stats.totalAttempts) * 100)
      : 0;

  const statCards = [
    {
      label: "คอร์สทั้งหมด",
      value: stats.totalCourses,
      sub: `เปิดอยู่ ${stats.openCourses} คอร์ส`,
      icon: BookOpen,
      color: "from-emerald-500 to-emerald-600",
      href: "/admin/courses",
    },
    {
      label: "ผู้ใช้งาน",
      value: stats.totalUsers,
      sub: data.userRoleCounts.map((r) => `${r.role} ${r.count}`).join(", "),
      icon: Users,
      color: "from-blue-500 to-blue-600",
      href: "/users",
    },
    {
      label: "พรรณไม้",
      value: stats.totalWoods,
      sub: `${data.woodsByWeight.length} กลุ่มน้ำหนัก`,
      icon: TreePine,
      color: "from-amber-500 to-amber-600",
      href: "/tree/treesearch",
    },
    {
      label: "ข้อสอบ",
      value: stats.totalExams,
      sub: `สอบแล้ว ${stats.totalAttempts} ครั้ง`,
      icon: ClipboardCheck,
      color: "from-purple-500 to-purple-600",
      href: "/admin/courses",
    },
    {
      label: "บทเรียน",
      value: stats.totalLessons,
      sub: `ใน ${stats.totalCourses} คอร์ส`,
      icon: FileText,
      color: "from-rose-500 to-rose-600",
      href: "/admin/courses",
    },
    {
      label: "การลงทะเบียน",
      value: stats.totalEnrollments,
      sub: `อัตราสอบเสร็จ ${examPassRate}%`,
      icon: UserCheck,
      color: "from-cyan-500 to-cyan-600",
      href: "/admin/courses",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col font-kanit">
      <Header showNav />
      <main className="flex-1 bg-gradient-to-b from-[#F1FAF0] to-[#fafdf9]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#14532D]">ภาพรวมระบบ</h1>
            <p className="text-sm text-[#6E8E59]">
              สรุปข้อมูลทั้งหมดของระบบ WoodCertify
            </p>
          </div>

          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6E8E59]">
                      {card.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-[#14532D]">
                      {card.value.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-[#93B08A]">{card.sub}</p>
                  </div>
                  <div
                    className={`rounded-xl bg-gradient-to-br ${card.color} p-2.5 text-white shadow-lg`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-[#CDE3BD] transition-all group-hover:text-emerald-500 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent courses */}
            <div className="lg:col-span-2 rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-[#14532D]">
                    คอร์สล่าสุด
                  </h2>
                </div>
                <Link
                  href="/admin/courses"
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  ดูทั้งหมด
                </Link>
              </div>
              <div className="space-y-3">
                {data.recentCourses.map((course) => (
                  <div
                    key={course.course_id}
                    className="flex items-center justify-between rounded-xl border border-[#F0F7EB] bg-[#FAFDF8] p-3 transition hover:bg-[#F0F7EB]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#14532D]">
                        {course.course_name}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#93B08A]">
                        <span>{course._count.enrollments} คนลงทะเบียน</span>
                        <span>{course._count.lessons} บทเรียน</span>
                        <span>{course._count.exams} ข้อสอบ</span>
                      </div>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          course.course_status === "SHOW"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {course.course_status === "SHOW" ? "เปิด" : "ปิด"}
                      </span>
                      <span className="text-[11px] text-[#93B08A]">
                        {formatDate(course.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
                {data.recentCourses.length === 0 && (
                  <p className="py-6 text-center text-sm text-[#93B08A]">
                    ยังไม่มีคอร์ส
                  </p>
                )}
              </div>
            </div>

            {/* Wood by weight + User roles */}
            <div className="space-y-6">
              {/* Wood by weight */}
              <div className="rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-amber-600" />
                  <h2 className="text-base font-bold text-[#14532D]">
                    พรรณไม้ตามน้ำหนัก
                  </h2>
                </div>
                <div className="space-y-3">
                  {data.woodsByWeight.map((w) => {
                    const pct =
                      stats.totalWoods > 0
                        ? Math.round((w.count / stats.totalWoods) * 100)
                        : 0;
                    return (
                      <div key={w.weight}>
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${WEIGHT_COLOR[w.weight] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {WEIGHT_LABEL[w.weight] ?? w.weight}
                          </span>
                          <span className="text-xs text-[#6E8E59]">
                            {w.count} ชนิด ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#F0F7EB]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              w.weight === "LIGHT"
                                ? "bg-emerald-400"
                                : w.weight === "MEDIUM"
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {data.woodsByWeight.length === 0 && (
                    <p className="py-4 text-center text-sm text-[#93B08A]">
                      ยังไม่มีข้อมูลพรรณไม้
                    </p>
                  )}
                </div>
              </div>

              {/* User roles */}
              <div className="rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-bold text-[#14532D]">
                    ผู้ใช้ตาม Role
                  </h2>
                </div>
                <div className="space-y-2">
                  {data.userRoleCounts.map((r) => (
                    <div
                      key={r.role}
                      className="flex items-center justify-between rounded-lg bg-[#FAFDF8] px-3 py-2"
                    >
                      <span className="text-sm font-medium text-[#14532D] capitalize">
                        {r.role}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent exam attempts */}
          <div className="mt-6 rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h2 className="text-base font-bold text-[#14532D]">
                ผลสอบล่าสุด
              </h2>
            </div>
            {data.recentAttempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F0F7EB] text-left text-xs text-[#6E8E59]">
                      <th className="pb-2 pr-4 font-medium">ผู้สอบ</th>
                      <th className="pb-2 pr-4 font-medium">ข้อสอบ</th>
                      <th className="pb-2 pr-4 font-medium text-center">
                        คะแนน
                      </th>
                      <th className="pb-2 font-medium text-right">
                        วันที่ส่ง
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentAttempts.map((a) => (
                      <tr
                        key={a.attempt_id}
                        className="border-b border-[#F0F7EB] last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-medium text-[#14532D]">
                          {a.user.first_name} {a.user.last_name}
                        </td>
                        <td className="py-2.5 pr-4 text-[#6E8E59]">
                          {a.exam.exam_title}
                        </td>
                        <td className="py-2.5 pr-4 text-center">
                          <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                            {a.total_score}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-xs text-[#93B08A]">
                          {formatDateTime(a.submit_datetime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-[#93B08A]">
                ยังไม่มีผลสอบ
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
