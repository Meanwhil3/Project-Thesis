// lib/exams/mapExamToListItem.ts
import {
  ExamStatus as PrismaExamStatus,
  ExamType as PrismaExamType,
  AttemptStatus as PrismaAttemptStatus,
} from "@prisma/client";
import type { ExamStatus, ExamTimeStatus, ExamAttemptStatus } from "@/components/Courses/Exams/ExamStatusBadge";
import type { ExamType, ExamListItemModel } from "@/components/Courses/Exams/ExamListItem";

function computeTimeStatus(openAt: Date | null, closeAt: Date | null): ExamTimeStatus {
  const now = new Date();
  if (openAt && now < openAt) return "not_started";
  if (closeAt && now > closeAt) return "closed";
  if (openAt && now >= openAt) return "open";
  // ไม่มี open_at/close_at = เปิดตลอด
  return "open";
}

export function mapExamToListItem(exam: {
  exam_id: bigint;
  exam_title: string;
  exam_type: PrismaExamType | null;
  created_at: Date;
  exam_status: PrismaExamStatus | null;
  open_at?: Date | null;
  close_at?: Date | null;
  author?: { first_name: string | null } | null;
  attempts?: {
    attempt_status: PrismaAttemptStatus;
    total_score: number;
  }[];
}): ExamListItemModel {
  const type: ExamType =
    exam.exam_type === PrismaExamType.FILL_IN_THE_BLANK ? "wood_fill" : "mcq";

  const status = (exam.exam_status ?? PrismaExamStatus.HIDE) as unknown as ExamStatus;

  const openAt = exam.open_at ?? null;
  const closeAt = exam.close_at ?? null;
  const timeStatus = computeTimeStatus(openAt, closeAt);

  // คำนวณสถานะการทำข้อสอบจาก attempt ล่าสุด
  let attemptStatus: ExamAttemptStatus = "not_attempted";
  let attemptScore: number | null = null;

  if (exam.attempts && exam.attempts.length > 0) {
    const latest = exam.attempts[0];
    if (latest.attempt_status === PrismaAttemptStatus.COMPLETED) {
      attemptStatus = "completed";
      attemptScore = latest.total_score;
    } else {
      attemptStatus = "in_progress";
    }
  }

  return {
    id: exam.exam_id.toString(),
    type,
    title: exam.exam_title,
    createdAt: exam.created_at.toISOString(),
    status,
    creatorFirstName: exam.author?.first_name ?? null,
    timeStatus,
    attemptStatus,
    attemptScore,
    openAt: openAt?.toISOString() ?? null,
    closeAt: closeAt?.toISOString() ?? null,
  };
}