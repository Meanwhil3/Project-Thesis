// components/Courses/NotEnrolledBanner.tsx
// แสดงแทนเนื้อหาบทเรียน/ข้อสอบ เมื่อ TRAINEE ยังไม่ได้ enroll
"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function NotEnrolledBanner({
  courseId,
  courseName,
}: {
  courseId: string;
  courseName?: string;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#CDE3BD] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FDF4]">
          <LockKeyhole className="h-7 w-7 text-[#14532D]" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-[#14532D]">
          คุณยังไม่ได้ลงทะเบียนคอร์สนี้
        </h2>

        <p className="mt-2 text-sm text-[#6E8E59]">
          {courseName
            ? `ลงทะเบียนเข้า "${courseName}" ก่อน เพื่อเข้าถึงบทเรียนและข้อสอบ`
            : "กรุณาลงทะเบียนเข้าคอร์สก่อน เพื่อเข้าถึงเนื้อหา"}
        </p>

        <Link
          href={`/courses/${courseId}`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#166534]"
        >
          ไปลงทะเบียน
        </Link>
      </div>
    </div>
  );
}