"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  BookOpen,
  Users,
  TreePine,
  GraduationCap,
  TrendingUp,
  Loader2,
  ArrowRight,
  UserPlus,
  PlusCircle,
  ClipboardCheck,
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showNav />
        <main className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-[#6E8E59]">กำลังโหลดข้อมูล...</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showNav />
        <main className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-red-50 p-3">
            <ClipboardCheck className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-sm font-medium text-red-600">
            ไม่สามารถโหลดข้อมูลได้
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          >
            ลองใหม่อีกครั้ง
          </button>
        </main>
      </div>
    );
  }

  const { stats } = data;

  const statCards = [
    {
      label: "คอร์สทั้งหมด",
      value: stats.totalCourses,
      sub: `เปิดอยู่ ${stats.openCourses} คอร์ส`,
      icon: BookOpen,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/admin/courses",
    },
    {
      label: "ผู้ใช้งาน",
      value: stats.totalUsers,
      sub: `ลงทะเบียนแล้ว ${stats.totalEnrollments} คน`,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/users",
    },
    {
      label: "พรรณไม้",
      value: stats.totalWoods,
      sub: `ในฐานข้อมูล`,
      icon: TreePine,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      href: "/tree/treesearch",
    },
  ];

  const quickActions = [
    {
      label: "สร้างคอร์สใหม่",
      icon: PlusCircle,
      href: "/admin/courses/new",
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      label: "จัดการผู้ใช้",
      icon: UserPlus,
      href: "/users",
      color: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      label: "จัดการพรรณไม้",
      icon: TreePine,
      href: "/tree/treesearch",
      color: "bg-amber-600 hover:bg-amber-700 text-white",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header showNav />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
          {/* Page title */}
          <div className="anim-fade-up mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[#14532D]">ภาพรวมระบบ</h1>
            <p className="text-sm text-[#6E8E59]">
              ระบบ WoodCertify
            </p>
          </div>

          {/* Stat cards - 3 cards only */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statCards.map((card, i) => (
              <Link
                key={card.label}
                href={card.href}
                className="anim-fade-up group rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl ${card.iconBg} p-2.5`}
                  >
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6E8E59]">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold text-[#14532D]">
                      {card.value.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-[#93B08A]">{card.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick actions */}
          <div className="anim-fade-up mb-8" style={{ animationDelay: "400ms" }}>
            <h2 className="mb-3 text-base font-bold text-[#14532D]">
              เมนูลัด
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${action.color}`}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent courses */}
          <div
            className="anim-fade-up mb-6 rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm"
            style={{ animationDelay: "500ms" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-[#14532D]">
                  คอร์สล่าสุด
                </h2>
              </div>
              <Link
                href="/admin/courses"
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors duration-200 hover:text-emerald-700 hover:underline"
              >
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentCourses.map((course) => (
                <div
                  key={course.course_id}
                  className="flex items-center justify-between rounded-xl border border-[#F0F7EB] bg-[#FAFDF8] p-3 transition-colors duration-200 hover:bg-[#F0F7EB]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#14532D]">
                      {course.course_name}
                    </p>
                    <p className="mt-1 text-xs text-[#93B08A]">
                      {course._count.enrollments} คนลงทะเบียน &middot;{" "}
                      {course._count.lessons} บทเรียน
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        course.course_status === "SHOW"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {course.course_status === "SHOW" ? "เปิด" : "ปิด"}
                    </span>
                    <span className="text-xs text-[#93B08A]">
                      {formatDate(course.created_at)}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentCourses.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8">
                  <BookOpen className="anim-float h-8 w-8 text-[#CDE3BD]" />
                  <p className="text-sm text-[#93B08A]">ยังไม่มีคอร์ส</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent exam attempts */}
          <div
            className="anim-fade-up rounded-2xl border border-[#CDE3BD] bg-white p-5 shadow-sm"
            style={{ animationDelay: "600ms" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h2 className="text-base font-bold text-[#14532D]">ผลสอบล่าสุด</h2>
            </div>
            {data.recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {data.recentAttempts.map((a) => (
                  <div
                    key={a.attempt_id}
                    className="flex items-center justify-between rounded-xl border border-[#F0F7EB] bg-[#FAFDF8] p-3 transition-colors hover:bg-[#F0F7EB]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#14532D]">
                        {a.user.first_name} {a.user.last_name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#93B08A]">
                        {a.exam.exam_title}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-3">
                      <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                        {a.total_score} คะแนน
                      </span>
                      <span className="text-xs text-[#93B08A]">
                        {formatDateTime(a.submit_datetime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <TrendingUp className="anim-float h-8 w-8 text-[#CDE3BD]" />
                <p className="text-sm text-[#93B08A]">ยังไม่มีผลสอบ</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
