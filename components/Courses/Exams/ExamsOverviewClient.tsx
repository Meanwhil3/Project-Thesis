// components/Courses/Exams/ExamsOverviewClient.tsx
"use client";

import { useActionState, useMemo, useState } from "react";
import { FileText, ListChecks, KeyRound } from "lucide-react";

import ExamTypeCard from "./ExamTypeCard";
import ExamListItem, { type ExamListItemModel, type ExamType } from "./ExamListItem";
import type { ExamStatus } from "./ExamStatusBadge";

import FilterSelect, { type SelectOption } from "@/components/ui/FilterSelect";
import type { JoinExamState } from "@/app/courses/[courseId]/exams/server-actions";

type TypeFilter = "all" | ExamType;
type StatusFilter = "all" | ExamStatus;

const typeOptions: ReadonlyArray<SelectOption<TypeFilter>> = [
  { value: "all", label: "ประเภท: ทั้งหมด" },
  { value: "wood_fill", label: "เติมข้อมูลพันธุ์ไม้" },
  { value: "mcq", label: "ปรนัย (MCQ)" },
] as const;

const statusOptions: ReadonlyArray<SelectOption<StatusFilter>> = [
  { value: "all", label: "สถานะ: ทั้งหมด" },
  { value: "HIDE", label: "ซ่อน (ร่าง)" },
  { value: "SHOW", label: "แสดง (เผยแพร่)" },
] as const;

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      disabled={pending}
      className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? "กำลังตรวจสอบรหัส..." : "เริ่มทำข้อสอบ"}
    </button>
  );
}


export default function ExamsOverviewClient({
  courseId,
  initialExams,
  canManage,
  joinExamAction,
}: {
  courseId: string;
  initialExams: ExamListItemModel[];
  canManage: boolean;
  joinExamAction: (prev: JoinExamState, formData: FormData) => Promise<JoinExamState>;
}) {
  // ✅ React 19: [state, action, isPending]
  const [joinState, joinAction, joinPending] = useActionState(joinExamAction, { ok: true });

  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | ExamType>("all");
  const [status, setStatus] = useState<"all" | ExamStatus>("all");

  const exams = useMemo(() => {
    const list = Array.isArray(initialExams) ? initialExams : [];
    const keyword = q.trim().toLowerCase();
    return list
      .filter((e) => (type === "all" ? true : e.type === type))
      .filter((e) => (status === "all" ? true : e.status === status))
      .filter((e) => (keyword ? e.title.toLowerCase().includes(keyword) : true));
  }, [initialExams, q, type, status]);

  return (
    <section className="rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
      <div>
        <div className="text-2xl font-medium text-[#14532D]">การสอบ</div>
        <div className="mt-1 text-sm text-[#14532D]/70">
          {canManage
            ? "เลือกประเภทเพื่อสร้างข้อสอบใหม่ และดูรายการข้อสอบทั้งหมด"
            : "กรอกรหัสเพื่อเข้าสอบ (ผู้เข้าสอบไม่สามารถสร้าง/แก้ไขข้อสอบได้)"}
        </div>
      </div>

      {/* ✅ TRAINEE UI */}
      {!canManage ? (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[#14532D]">
            <KeyRound className="h-4 w-4" />
            เข้าสอบด้วยรหัส
          </div>

          <form action={joinAction} className="mt-3 grid gap-3">
            <input
              name="code"
              placeholder="เช่น A1B2C3"
              maxLength={6}
              className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm uppercase outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
              required
            />

            {joinState?.ok === false && joinState?.message ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {joinState.message}
              </div>
            ) : null}

            <SubmitButton  pending={joinPending}  />
          </form>
        </div>
      ) : (
        <>
          {/* ✅ ADMIN/EXAMINER Create cards */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ExamTypeCard
              title="เติมข้อมูลพันธุ์ไม้"
              description="สร้างข้อสอบแบบกรอกคำตอบ/รหัสคำตอบ พร้อมกำหนดคะแนน"
              href={`/courses/${courseId}/exams/new/wood-fill`}
              Icon={FileText}
            />
            <ExamTypeCard
              title="ปรนัย (MCQ)"
              description="Multiple Choice Questions (ข้อสอบปรนัย)"
              href={`/courses/${courseId}/exams/new/mcq`}
              Icon={ListChecks}
            />
          </div>

          {/* Filters */}
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาชื่อการสอบ..."
              className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
            />

            <FilterSelect<TypeFilter>
              value={type}
              onValueChange={setType}
              placeholder="เลือกประเภท"
              options={typeOptions}
            />

            <FilterSelect<StatusFilter>
              value={status}
              onValueChange={setStatus}
              placeholder="เลือกสถานะ"
              options={statusOptions}
            />
          </div>

          {/* List */}
          <div className="mt-6 space-y-4">
            {exams.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-[#14532D]/70">
                ไม่พบข้อสอบที่ตรงกับเงื่อนไข
              </div>
            ) : (
              exams.map((exam) => (
                <ExamListItem key={exam.id} courseId={courseId} exam={exam} />
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
