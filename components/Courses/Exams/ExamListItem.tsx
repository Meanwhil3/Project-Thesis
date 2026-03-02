"use client";

import Link from "next/link";
import ExamStatusBadge, { type ExamStatus } from "./ExamStatusBadge";
import { FileText, ListChecks, XCircle, User as UserIcon } from "lucide-react";

export type ExamType = "wood_fill" | "mcq"; // UI type

export type ExamListItemModel = {
  id: string;
  type: ExamType;
  title: string;
  createdAt: string; // ISO string
  status: ExamStatus; // "HIDE" | "SHOW"
  creatorFirstName: string | null;
};

function typeLabel(t: ExamType) {
  return t === "wood_fill" ? "เติมข้อมูลพันธุ์ไม้" : "ปรนัย";
}

function typeIcon(t: ExamType) {
  return t === "wood_fill" ? FileText : ListChecks;
}

export default function ExamListItem({
  courseId,
  exam,
  canManage,
}: {
  courseId: string;
  exam: ExamListItemModel;
  canManage: boolean;
}) {
  // ✅ TRAINEE ไม่เห็นข้อสอบร่าง
  if (!canManage && exam.status === "HIDE") return null;

  const Icon = typeIcon(exam.type);

  const href = canManage
    ? `/courses/${courseId}/exams/${exam.id}/edit`
    : `/courses/${courseId}/exams/${exam.id}/take`;

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-black/10 bg-white p-5 shadow-[0_0_4px_0_#CAE0BC] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(20,83,45,0.12)]"
      aria-label={canManage ? "จัดการข้อสอบ" : "ทำข้อสอบ"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-green-50">
            <Icon className="h-5 w-5 text-green-800" />
          </div>

          <div>
            <div className="text-sm text-green-900/70">{typeLabel(exam.type)}</div>

            <div className="mt-0.5 text-lg font-medium text-green-900">
              {exam.title}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-green-900/60">
              <span>
                {new Date(exam.createdAt).toLocaleString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="inline-flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" />
                ผู้สร้าง:{" "}
                <b className="font-medium">{exam.creatorFirstName ?? "ไม่ระบุ"}</b>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExamStatusBadge status={exam.status} />
          {canManage && exam.status === "HIDE" ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : null}
        </div>
      </div>
    </Link>
  );
}