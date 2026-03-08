// app/admin/courses/[courseId]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import EditCourseClient from "./EditCourseClient";

export const runtime = "nodejs";

function formatDateInput(d: Date | null) {
  if (!d) return "";
  // en-CA จะได้รูปแบบ YYYY-MM-DD และ fix timezone เป็น Bangkok กันวันเลื่อน
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>; // Next 15 ต้อง await params 
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = String((session.user as any)?.role ?? "").toUpperCase();
  if (role === "TRAINEE") redirect("/");

  const { courseId } = await params;

  let courseIdBig: bigint;
  try {
    courseIdBig = BigInt(courseId);
  } catch {
    notFound();
  }

  const c = await prisma.course.findUnique({
    where: { course_id: courseIdBig },
    select: {
      course_id: true,
      course_name: true,
      course_description: true,
      image_url: true,
      location: true,
      start_date: true,
      end_date: true,
      course_status: true, // SHOW/HIDE
      enroll_code: true,
      deleted_at: true,
    },
  });

  if (!c || c.deleted_at) notFound();

  return (
    <EditCourseClient
      courseId={courseId}
      initial={{
        title: c.course_name ?? "",
        subtitle: c.course_description ?? "",
        enrollCode: c.enroll_code ?? "",
        imageUrl: c.image_url ?? "https://placehold.co/760x380",
        location: c.location ?? "",
        startDate: formatDateInput(c.start_date),
        endDate: formatDateInput(c.end_date),
        status: c.course_status === "SHOW" ? "open" : "closed",
      }}
    />
  );
}
