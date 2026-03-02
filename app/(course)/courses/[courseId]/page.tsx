// app/courses/[courseId]/page.tsx
import {
  Megaphone,
  Pencil,
  Plus,
  Info,
  Users,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getEnrollmentStatus } from "@/lib/getEnrollmentStatus";
import EnrollButton from "@/components/Courses/EnrollButton";

type Announcement = {
  id: string;
  title: string;
  message: string;
  meta: string;
};

type Instructor = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

function buildGoogleMapsUrl(query: string) {
  const q = query.trim();
  if (!q) return "https://www.google.com/maps";
  const params = new URLSearchParams({ api: "1", query: q });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function formatThaiDate(d: Date | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

function SectionShell({
  title,
  icon: Icon,
  right,
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
        {right}
      </div>

      <div className="px-7 pb-7 sm:px-8">{children}</div>
    </section>
  );
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: courseIdStr } = await params; // ✅ Next 15 ต้อง await

  let courseId: bigint;
  try {
    courseId = BigInt(courseIdStr);
  } catch {
    notFound();
  }

  // --- fetch course + enrollment status in parallel ---
  const [course, { status: enrollStatus }] = await Promise.all([
    prisma.course.findUnique({
      where: { course_id: courseId },
      select: {
        course_id: true,
        course_name: true,
        course_description: true,
        location: true,
        deleted_at: true,
      },
    }),
    getEnrollmentStatus(courseId),
  ]);

  if (!course || course.deleted_at) notFound();

  const session = await getServerSession(authOptions);
  const role = String((session?.user as any)?.role ?? "").toUpperCase();
  const isTrainee = role === "TRAINEE";

  const courseDescription =
    course.course_description ?? "ยังไม่มีคำอธิบายคอร์ส";
  const courseLocation = course.location ?? "";

  // --- fetch announcements ---
  const annRows = await prisma.announcements.findMany({
    where: {
      course_id: courseId,
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
    select: {
      announcement_id: true,
      title: true,
      content: true,
      created_at: true,
    },
    take: 20,
  });

  const announcements: Announcement[] = annRows.map((a) => ({
    id: a.announcement_id.toString(),
    title: a.title,
    message: a.content,
    meta: a.created_at ? formatThaiDate(a.created_at) : "",
  }));

  // --- fetch instructors (join table Instructor -> User) ---
  // ❗ สำคัญ: ไม่ใส่ deleted_at ที่นี่เพื่อเลี่ยง PrismaClientValidationError ที่คุณเจอ
  const insRows = await prisma.instructor.findMany({
    where: {
      course_id: courseId,
      // ถ้าคุณ migrate + generate แล้ว และ Instructor มี deleted_at จริง ค่อยเปิดบรรทัดนี้กลับ:
      // deleted_at: null,
    },
    include: {
      user: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
    // ถ้า Instructor ไม่มี created_at ใน DB/Prisma ตอนนี้ อย่า orderBy created_at
    // orderBy: { created_at: "desc" },
  });

  const instructors: Instructor[] = insRows.map((r) => ({
    id: `${r.user_id.toString()}-${r.course_id.toString()}`,
    name: `${r.user.first_name} ${r.user.last_name}`.trim(),
    email: r.user.email,
    avatarUrl: "https://placehold.co/60x60",
  }));

  // TODO: ผูกสิทธิ์จริง
  const canManageAnnouncements = true;
  const canEditAnnouncements = true;
  const canManageInstructors = true;

  return (
    <div className="grid gap-6">
      {/* Enroll button — แสดงเฉพาะ TRAINEE */}
      {isTrainee && (
        <div className="flex justify-end">
          <EnrollButton
            courseId={courseIdStr}
            courseName={course.course_name}
            enrolled={enrollStatus === "enrolled"}
          />
        </div>
      )}

      {/* Announcements */}
      <SectionShell
        title="ประกาศ"
        icon={Megaphone}
        right={
          canManageAnnouncements ? (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#16A34A] px-4 font-kanit text-[14px] font-medium text-white shadow-[0_10px_30px_-18px_rgba(22,163,74,0.65)] transition hover:opacity-95 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              เพิ่มประกาศ
            </button>
          ) : null
        }
      >
        <div className="space-y-4">
          {announcements.length ? (
            announcements.map((a) => (
              <article
                key={a.id}
                className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(20,83,45,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-22px_rgba(20,83,45,0.45)]"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-28 w-28 rounded-full bg-[#DCFCE7]/50 blur-2xl" />

                {canEditAnnouncements && (
                  <button
                    type="button"
                    className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 active:scale-[0.98]"
                    aria-label="แก้ไขประกาศ"
                  >
                    <Pencil className="h-5 w-5 text-[#111827]" />
                  </button>
                )}

                <div className="font-kanit">
                  <div className="text-[14px] font-medium text-[#14532D]">
                    {a.title}
                  </div>
                  <div className="mt-2 text-[12px] leading-5 text-[#2D5C3F]">
                    {a.message}
                  </div>
                  <div className="mt-3 text-[10px] text-[#6E8E59]">
                    {a.meta}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-[#CDE3BD] bg-white p-5 text-sm text-[#6E8E59]">
              ยังไม่มีประกาศในคอร์สนี้
            </div>
          )}
        </div>
      </SectionShell>

      {/* 2 columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course detail */}
        <SectionShell title="รายละเอียดอบรม" icon={Info}>
          <div className="text-[15px] leading-7 text-[#14532D]">
            <p className="rounded-2xl bg-[#F8FFF9] p-5 ring-1 ring-[#BBF7D0]/70">
              {courseDescription}
            </p>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#CDE3BD] bg-white p-5">
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
            </div>
          </div>
        </SectionShell>

        {/* Instructors */}
        <SectionShell
          title="รายชื่อผู้สอน"
          icon={Users}
          right={
            canManageInstructors ? (
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 active:scale-[0.98]"
                aria-label="จัดการผู้สอน"
              >
                <Pencil className="h-5 w-5 text-[#111827]" />
              </button>
            ) : null
          }
        >
          <div className="grid gap-3">
            {instructors.length ? (
              instructors.map((ins) => (
                <div
                  key={ins.id}
                  className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-22px_rgba(20,83,45,0.45)]"
                >
                  <img
                    src={ins.avatarUrl || "https://placehold.co/60x60"}
                    alt={ins.name}
                    className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
                  />

                  <div className="min-w-0 font-kanit">
                    <div className="truncate text-[14px] font-medium text-[#3A532D]">
                      {ins.name}
                    </div>
                    <a
                      href={`mailto:${ins.email}`}
                      className="truncate text-[14px] text-[#0C6E30] underline underline-offset-2"
                    >
                      {ins.email}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-[#CDE3BD] bg-white p-5 text-sm text-[#6E8E59]">
                ยังไม่มีผู้สอนในคอร์สนี้
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-[#F8FFF9] p-4 text-[12px] text-[#6E8E59] ring-1 ring-[#BBF7D0]/60">
            * ผู้สอนที่ถูกเพิ่มในคอร์ส สามารถสร้าง/แก้ไข/ลบบทเรียนได้ แต่ไม่สามารถลบคอร์สได้
          </div>
        </SectionShell>
      </div>
    </div>
  );
}
