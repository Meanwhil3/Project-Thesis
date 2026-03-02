// components/Courses/Exams/forms/McqQuestionItem.tsx
"use client";

import { Plus, Trash2 } from "lucide-react";

export type McqOptionDraft = { key: string; text: string };
export type McqQuestionDraft = {
  key: string;
  prompt: string;
  score: number;
  options: McqOptionDraft[];
  correctKey: string;
};

export default function McqQuestionItem(props: {
  index: number;
  q: McqQuestionDraft;

  onRemove: () => void;
  onPatch: (patch: Partial<McqQuestionDraft>) => void;

  onUpdateOption: (optKey: string, text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optKey: string) => void;
}) {
  const { index, q, onRemove, onPatch, onUpdateOption, onAddOption, onRemoveOption } = props;

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
          <div className="font-kanit text-sm text-[#14532D]">คำถาม</div>
          <textarea
            value={q.prompt}
            onChange={(e) => onPatch({ prompt: e.target.value })}
            className="mt-2 min-h-[90px] w-full rounded-2xl border border-black/10 p-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
            placeholder="พิมพ์คำถาม..."
          />
        </div>

        <div>
          <div className="font-kanit text-sm text-[#166534]">คะแนน</div>
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
        <div className="font-kanit text-sm text-[#166534]">ตัวเลือก (เลือกคำตอบที่ถูกต้อง)</div>
        <button
          type="button"
          onClick={onAddOption}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 font-kanit text-xs text-[#14532D]"
        >
          <Plus className="h-4 w-4" />
          เพิ่มตัวเลือก
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {q.options.map((opt, i) => (
          <div key={opt.key} className="flex items-start gap-3">
            <input
              type="radio"
              name={`correct-${q.key}`}
              checked={q.correctKey === opt.key}
              onChange={() => onPatch({ correctKey: opt.key })}
              className="mt-3 h-4 w-4"
            />
            <div className="w-full">
              <div className="font-kanit text-xs text-[#14532D]/70">ตัวเลือก {i + 1}</div>
              <input
                value={opt.text}
                onChange={(e) => onUpdateOption(opt.key, e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
                placeholder="กรอกคำตอบ..."
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveOption(opt.key)}
              disabled={q.options.length <= 2}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-red-50 disabled:opacity-40"
              title="ลบตัวเลือก"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
