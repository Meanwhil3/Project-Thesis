// components/Courses/Exams/forms/WoodFillQuestionItem.tsx
"use client";

import { Plus, Trash2 } from "lucide-react";

export type WoodFillCodeDraft = { key: string; code: string };

export type WoodFillQuestionDraft = {
  key: string;
  woodName: string; // -> question_detail
  score: number;
  answerCodes: WoodFillCodeDraft[]; // -> Choices (is_correct=true)
};

export default function WoodFillQuestionItem(props: {
  index: number;
  q: WoodFillQuestionDraft;

  onRemove: () => void;
  onPatch: (patch: Partial<WoodFillQuestionDraft>) => void;

  onAddCode: () => void;
  onUpdateCode: (codeKey: string, value: string) => void;
  onRemoveCode: (codeKey: string) => void;
}) {
  const { index, q, onRemove, onPatch, onAddCode, onUpdateCode, onRemoveCode } = props;

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="font-kanit text-lg font-medium text-[#14532D]">ข้อที่ {index}</div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 font-kanit text-xs text-[#14532D] hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
          ลบข้อ
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="font-kanit text-sm text-[#14532D]">ชื่อพันธุ์ไม้ / คำถาม *</div>
          <input
            value={q.woodName}
            onChange={(e) => onPatch({ woodName: e.target.value })}
            className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
            placeholder="เช่น ไม้สัก, ไม้แดง, ..."
          />
        </div>

        <div>
          <div className="font-kanit text-sm text-[#166534]">คะแนน *</div>
          <input
            type="number"
            min={1}
            value={q.score}
            onChange={(e) => onPatch({ score: Number(e.target.value) })}
            className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="font-kanit text-sm text-[#166534]">รหัสคำตอบที่ยอมรับได้ (อย่างน้อย 1 ค่า) *</div>
        <button
          type="button"
          onClick={onAddCode}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 font-kanit text-xs text-[#14532D]"
        >
          <Plus className="h-4 w-4" />
          เพิ่มรหัส
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {q.answerCodes.map((c, i) => (
          <div key={c.key} className="flex items-center gap-3">
            <div className="min-w-14 shrink-0 font-kanit text-xs text-[#14532D]/70">รหัส {i + 1}</div>

            <input
              value={c.code}
              onChange={(e) => onUpdateCode(c.key, e.target.value)}
              className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
              placeholder="เช่น TEAK-001 / รหัสคำตอบ"
            />

            <button
              type="button"
              onClick={() => onRemoveCode(c.key)}
              disabled={q.answerCodes.length <= 1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              title="ลบรหัส"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
