// components/Courses/Exams/ExamsOverviewClient.tsx
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
  { value: "wood_fill", label: "เติมข้อมูลพรรณไม้" },
  { value: "mcq", label: "ปรนัย" },
] as const;

const statusOptions: ReadonlyArray<SelectOption<StatusFilter>> = [
  { value: "all", label: "สถานะ: ทั้งหมด" },
  { value: "HIDE", label: "ซ่อน (ร่าง)" },
  { value: "SHOW", label: "แสดง (เผยแพร่)" },
] as const;

export default function ExamsOverviewClient({
  courseId,
  initialExams,
  canManage,
}: {
  courseId: string;
  initialExams: ExamListItemModel[];
  canManage: boolean;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const exams = useMemo(() => {
    const list = Array.isArray(initialExams) ? initialExams : [];
    const keyword = q.trim().toLowerCase();

    return list
      //  TRAINEE: บังคับเห็นเฉพาะ SHOW (ถึงแม้ list จะหลุดมา)
      .filter((e) => (canManage ? true : e.status === "SHOW"))
      .filter((e) => (type === "all" ? true : e.type === type))
      //  สถานะ filter ให้ใช้เฉพาะฝั่ง canManage
      .filter((e) => (canManage ? (status === "all" ? true : e.status === status) : true))
      .filter((e) => (keyword ? e.title.toLowerCase().includes(keyword) : true));
  }, [initialExams, q, type, status, canManage]);

  return (
    <section className="rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
      <div>
        <div className="text-2xl font-medium text-[#14532D]">การสอบ</div>
        <div className="mt-1 text-sm text-[#14532D]/70">
          {canManage
            ? "เลือกประเภทเพื่อสร้างข้อสอบใหม่ และดูรายการข้อสอบทั้งหมด"
            : "กรอกรหัสเพื่อเข้าสอบ และดูเฉพาะข้อสอบที่เผยแพร่"}
        </div>
      </div>

      {/* ✅ Create cards: โชว์เฉพาะคนที่ manage ได้ */}
      {canManage ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ExamTypeCard
            title="เติมข้อมูลพรรณไม้"
            description="สร้างข้อสอบแบบกรอกคำตอบ/รหัสคำตอบ พร้อมกำหนดคะแนน"
            href={`/courses/${courseId}/exams/new/wood-fill`}
            Icon={FileText}
          />
          <ExamTypeCard
            title="ปรนัย"
            description="ข้อสอบปรนัย เลือกคำตอบที่ถูกต้อง"
            href={`/courses/${courseId}/exams/new/mcq`}
            Icon={ListChecks}
          />
        </div>
      ) : null}

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

        {/* ✅ TRAINEE: ไม่ต้องเห็น filter สถานะ (เพราะเห็นได้แค่ SHOW อยู่แล้ว) */}
        {canManage ? (
          <FilterSelect<StatusFilter>
            value={status}
            onValueChange={setStatus}
            placeholder="เลือกสถานะ"
            options={statusOptions}
          />
        ) : (
          <div className="hidden md:block" />
        )}
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {exams.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-[#14532D]/70">
            ไม่พบข้อสอบที่ตรงกับเงื่อนไข
          </div>
        ) : (
          exams.map((exam) => (
            <ExamListItem key={exam.id} courseId={courseId} exam={exam} canManage={canManage} />
          ))
        )}
      </div>
    </section>
  );
}
