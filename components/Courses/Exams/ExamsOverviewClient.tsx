"use client";

import { useMemo, useState } from "react";
import { FileText, ListChecks } from "lucide-react";

import ExamTypeCard from "./ExamTypeCard";
import ExamListItem, { type ExamListItemModel, type ExamType } from "./ExamListItem";
import type { ExamStatus } from "./ExamStatusBadge";

import FilterSelect, { type SelectOption } from "@/components/ui/FilterSelect";

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

export default function ExamsOverviewClient({
  courseId,
  initialExams,
}: {
  courseId: string;
  initialExams: ExamListItemModel[]; // ✅ รับจาก DB (server) แล้วมา filter ต่อที่ client
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const exams = useMemo(() => {
    const list = Array.isArray(initialExams) ? initialExams : [];
    const keyword = q.trim().toLowerCase();
    return initialExams
      .filter((e) => (type === "all" ? true : e.type === type))
      .filter((e) => (status === "all" ? true : e.status === status))
      .filter((e) => (keyword ? e.title.toLowerCase().includes(keyword) : true));
  }, [initialExams, q, type, status]);

  return (
    <section className="rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
      <div>
        <div className="text-2xl font-medium text-[#14532D]">การสอบ</div>
        <div className="mt-1 text-sm text-[#14532D]/70">
          เลือกประเภทเพื่อสร้างข้อสอบใหม่ และดูรายการข้อสอบทั้งหมด
        </div>
      </div>

      {/* Create cards */}
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
          exams.map((exam) => <ExamListItem key={exam.id} courseId={courseId} exam={exam} />)
        )}
      </div>
    </section>
  );
}
