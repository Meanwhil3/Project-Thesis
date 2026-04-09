"use client";

import Link from "next/link";
import ExamStatusBadge, {
  ExamTimeBadge,
  ExamAttemptBadge,
  type ExamStatus,
  type ExamTimeStatus,
  type ExamAttemptStatus,
} from "./ExamStatusBadge";
import { FileText, ListChecks, User as UserIcon } from "lucide-react";

export type ExamType = "wood_fill" | "mcq";

export type ExamListItemModel = {
  id: string;
  type: ExamType;
  title: string;
  createdAt: string;
  status: ExamStatus;
  creatorFirstName: string | null;
  timeStatus: ExamTimeStatus;
  attemptStatus: ExamAttemptStatus;
  attemptScore: number | null;
  openAt: string | null;
  closeAt: string | null;
};

function typeLabel(t: ExamType) {
  return t === "wood_fill" ? "เติมข้อมูลพันธุ์ไม้" : "ปรนัย";
}

function typeIcon(t: ExamType) {
  return t === "wood_fill" ? FileText : ListChecks;
}

function formatThaiDateTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-50">
            <Icon className="h-5 w-5 text-green-800" />
          </div>

          <div className="min-w-0">
            <div className="text-sm text-green-900/70">{typeLabel(exam.type)}</div>

            <div className="mt-0.5 text-lg font-medium text-green-900">
              {exam.title}
            </div>

            {/* Meta info */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-green-900/60">
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

            {/* Open/Close schedule */}
            {(exam.openAt || exam.closeAt) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-green-900/50">
                {exam.openAt && (
                  <span>เปิด: {formatThaiDateTime(exam.openAt)}</span>
                )}
                {exam.closeAt && (
                  <span>ปิด: {formatThaiDateTime(exam.closeAt)}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          {/* Admin/Examiner: visibility badge */}
          {canManage && <ExamStatusBadge status={exam.status} />}

          {/* Admin: เห็นสถานะเวลาทุกแบบ / Trainee: เห็นเฉพาะ "หมดเวลา" */}
          {canManage ? (
            <ExamTimeBadge status={exam.timeStatus} />
          ) : (
            exam.timeStatus === "closed" && <ExamTimeBadge status="closed" />
          )}

          {/* Trainee: แสดงป้าย ทำแล้ว/ยังไม่ทำ/กำลังทำ */}
          {!canManage && (
            <ExamAttemptBadge
              status={exam.attemptStatus}
              score={exam.attemptScore}
            />
          )}
        </div>
      </div>
    </Link>
  );
}
