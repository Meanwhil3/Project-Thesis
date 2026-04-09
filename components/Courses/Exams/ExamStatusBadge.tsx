import * as React from "react";
import { Eye, EyeOff, LockOpen, Lock, CheckCircle2, Clock } from "lucide-react";

export type ExamStatus = "HIDE" | "SHOW";

// สถานะเปิด/ปิดรับสอบ (คำนวณจาก open_at / close_at)
export type ExamTimeStatus = "not_started" | "open" | "closed";

// สถานะการทำข้อสอบของผู้เรียน
export type ExamAttemptStatus = "not_attempted" | "in_progress" | "completed";

/* ─── Visibility Badge (ADMIN/EXAMINER) ─── */

const visibilityStyles: Record<ExamStatus, string> = {
  HIDE: "bg-slate-100 text-slate-600 border-slate-200",
  SHOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const visibilityLabels: Record<ExamStatus, string> = {
  HIDE: "ซ่อน",
  SHOW: "เผยแพร่",
};

const VisibilityIcon: Record<ExamStatus, React.ElementType> = {
  HIDE: EyeOff,
  SHOW: Eye,
};

export default function ExamStatusBadge({ status }: { status: ExamStatus }) {
  const Icon = VisibilityIcon[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        visibilityStyles[status],
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {visibilityLabels[status]}
    </span>
  );
}

/* ─── Time Status Badge (เปิด/ปิดรับสอบ) ─── */

const timeStyles: Record<ExamTimeStatus, string> = {
  not_started: "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-red-50 text-red-600 border-red-200",
};

const timeLabels: Record<ExamTimeStatus, string> = {
  not_started: "ยังไม่เปิดสอบ",
  open: "เปิดรับสอบ",
  closed: "ปิดรับสอบแล้ว",
};

const TimeIcon: Record<ExamTimeStatus, React.ElementType> = {
  not_started: Clock,
  open: LockOpen,
  closed: Lock,
};

export function ExamTimeBadge({ status }: { status: ExamTimeStatus }) {
  const Icon = TimeIcon[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        timeStyles[status],
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {timeLabels[status]}
    </span>
  );
}

/* ─── Attempt Status Badge (ทำแล้ว/ยังไม่ทำ) ─── */

const attemptStyles: Record<ExamAttemptStatus, string> = {
  not_attempted: "bg-slate-50 text-slate-600 border-slate-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const attemptLabels: Record<ExamAttemptStatus, string> = {
  not_attempted: "ยังไม่ได้ทำ",
  in_progress: "กำลังทำ",
  completed: "ทำแล้ว",
};

const AttemptIcon: Record<ExamAttemptStatus, React.ElementType> = {
  not_attempted: Clock,
  in_progress: Clock,
  completed: CheckCircle2,
};

export function ExamAttemptBadge({ status, score }: { status: ExamAttemptStatus; score?: number | null }) {
  const Icon = AttemptIcon[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        attemptStyles[status],
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {attemptLabels[status]}
      {status === "completed" && score != null && (
        <span className="ml-0.5">({score} คะแนน)</span>
      )}
    </span>
  );
}
