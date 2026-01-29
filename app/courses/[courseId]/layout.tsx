import type { ReactNode } from "react";
import { BookOpen, FileText, Users, Pencil } from "lucide-react";
import CourseTabs from "@/components/Courses/CourseTabs";
import BackButton from "@/components/Courses/BackButton";

type Course = {
  id: string;
  title: string;
  subtitle: string;
  bannerUrl: string;
  lessonsCount: number;
  examsCount: number;
  membersCount: number;
};

function getMockCourse(courseId: string): Course {
  return {
    id: courseId,
    title: "อบรมการจำแนกไม้เบื้องต้น",
    subtitle: "อบรมรุ่นที่ 1",
    bannerUrl: "https://placehold.co/1200x250",
    lessonsCount: 127,
    examsCount: 127,
    membersCount: 127,
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#DCFCE7]/55 blur-2xl transition group-hover:scale-105" />
      <div className="flex items-center justify-between gap-4">
        <div className="font-kanit">
          <div className="text-[16px] font-normal text-[#14532D]/80">{label}</div>
          <div className="mt-1 text-[34px] font-medium tracking-tight text-[#14532D]">
            {value}
          </div>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5 transition group-hover:scale-[1.02]">
          <Icon className="h-7 w-7 text-[#14532D]" />
        </div>
      </div>
    </div>
  );
}

export default function CourseLayout({
  params,
  children,
}: {
  params: { courseId: string };
  children: ReactNode;
}) {
  const course = getMockCourse(params.courseId);

  // TODO: ผูกสิทธิ์จริงจาก session/role
  const canEditCourse = true;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_400px_at_20%_0%,rgba(187,247,208,0.35),transparent_55%),linear-gradient(135deg,#F0FCF3_0%,#FEFBEB_100%)]">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Back */}
        <div className="mb-6">
          <BackButton href="/admin/courses"/>
        </div>

        {/* Banner */}
        <section className="relative overflow-hidden rounded-3xl shadow-[0_10px_40px_-26px_rgba(20,83,45,0.55)] ring-1 ring-black/5">
          <img
            src={course.bannerUrl}
            alt={course.title}
            className="h-[240px] w-full object-cover sm:h-[260px]"
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_220px_at_30%_80%,rgba(0,0,0,0.35),transparent_60%)]" />

          {/* text */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 sm:left-10 sm:right-10">
            <div className="max-w-3xl font-kanit">
              <div className="text-[26px] font-medium text-white drop-shadow sm:text-[38px]">
                {course.title}
              </div>
              <div className="mt-1 text-[16px] font-medium text-white/90 sm:text-[20px]">
                {course.subtitle}
              </div>
            </div>
          </div>

          {/* Edit */}
          <div className="absolute right-5 top-5">
            <button
              type="button"
              disabled={!canEditCourse}
              className={[
                "inline-flex h-10 items-center gap-2 rounded-full bg-white/90 px-4 font-kanit text-[13px] text-[#111827] shadow-[0_0_6px_rgba(0,0,0,0.15)] ring-1 ring-black/10 backdrop-blur transition",
                canEditCourse ? "hover:bg-white active:scale-[0.99]" : "cursor-not-allowed opacity-60",
              ].join(" ")}
            >
              <Pencil className="h-4 w-4" />
              แก้ไข
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <StatCard label="จำนวนบทเรียน" value={course.lessonsCount} icon={BookOpen} />
          <StatCard label="จำนวนการสอบ" value={course.examsCount} icon={FileText} />
          <StatCard label="สมาชิกทั้งหมด" value={course.membersCount} icon={Users} />
        </div>

        {/* Tabs */}
        <CourseTabs courseId={params.courseId} />

        {/* Content */}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
