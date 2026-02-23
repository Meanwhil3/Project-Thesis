// lib/exams/mapExamToListItem.ts
import { ExamStatus as PrismaExamStatus, ExamType as PrismaExamType } from "@prisma/client";
import type { ExamStatus } from "@/components/Courses/Exams/ExamStatusBadge";
import type { ExamType, ExamListItemModel } from "@/components/Courses/Exams/ExamListItem";

// ✅ pure function (ใช้ได้ทั้ง server/client)
export function mapExamToListItem(exam: {
  exam_id: bigint;
  exam_title: string;
  exam_type: PrismaExamType | null;
  created_at: Date;
  exam_status: PrismaExamStatus | null;
  author?: { first_name: string | null } | null;
}): ExamListItemModel {
  const type: ExamType =
    exam.exam_type === PrismaExamType.FILL_IN_THE_BLANK ? "wood_fill" : "mcq";

  const status = (exam.exam_status ?? PrismaExamStatus.HIDE) as unknown as ExamStatus;

  return {
    id: exam.exam_id.toString(),
    type,
    title: exam.exam_title,
    createdAt: exam.created_at.toISOString(),
    status,
    creatorFirstName: exam.author?.first_name ?? null,
  };
}