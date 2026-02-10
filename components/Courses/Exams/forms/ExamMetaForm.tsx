// components/Courses/Exams/forms/ExamMetaForm.tsx
"use client";

import FilterSelect, { type SelectOption } from "@/components/ui/FilterSelect";
import { RefreshCw } from "lucide-react";

export type ExamStatus = "draft" | "published" | "closed";

const statusOptions: ReadonlyArray<SelectOption<ExamStatus>> = [
  { value: "draft", label: "ร่าง" },
  { value: "published", label: "เผยแพร่" },
  { value: "closed", label: "ปิด" },
] as const;

export default function ExamMetaForm(props: {
  title: string;
  setTitle: (v: string) => void;

  accessCode?: string;
  setAccessCode?: (v: string) => void;
  onRegenerateCode?: () => void;

  description: string;
  setDescription: (v: string) => void;

  examDate: string;
  setExamDate: (v: string) => void;

  durationMinutes: number;
  setDurationMinutes: (v: number) => void;

  status: ExamStatus;
  setStatus: (v: ExamStatus) => void;
}) {
  const {
    title,
    setTitle,
    accessCode,
    setAccessCode,
    onRegenerateCode,
    description,
    setDescription,
    examDate,
    setExamDate,
    durationMinutes,
    setDurationMinutes,
    status,
    setStatus,
  } = props;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="font-kanit text-sm text-[#166534]">ชื่อการสอบ *</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
          placeholder="ชื่อการสอบ"
        />
      </div>

      {typeof accessCode === "string" && setAccessCode ? (
        <div>
          <div className="font-kanit text-sm text-[#166534]">รหัสเข้าสอบ *</div>
          <div className="mt-2 flex gap-2">
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
              placeholder="000000"
            />
            {onRegenerateCode ? (
              <button
                type="button"
                onClick={onRegenerateCode}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-3"
                title="สุ่มรหัส"
              >
                <RefreshCw className="h-4 w-4 text-[#14532D]" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div />
      )}

      <div className="md:col-span-3">
        <div className="font-kanit text-sm text-[#166534]">รายละเอียดการสอบ</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 min-h-[90px] w-full rounded-2xl border border-black/10 p-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
          placeholder="รายละเอียด (ไม่บังคับ)"
        />
      </div>

      <div>
        <div className="font-kanit text-sm text-[#166534]">วันที่สอบ</div>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
        />
      </div>

      <div>
        <div className="font-kanit text-sm text-[#166534]">เวลาในการสอบ (นาที)</div>
        <input
          type="number"
          min={1}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
        />
      </div>

      <div>
        <div className="text-sm text-[#166534]">สถานะ</div>
        <div className="mt-2">
          <FilterSelect<ExamStatus>
            value={status}
            onValueChange={setStatus}
            placeholder="เลือกสถานะ"
            options={statusOptions}
          />
        </div>
      </div>
    </div>
  );
}
