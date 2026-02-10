// components/Courses/Exams/forms/McqEditor.tsx
"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import McqQuestionItem, { type McqQuestionDraft } from "./McqQuestionItem";

function makeDefaultQuestion(): McqQuestionDraft {
  const o1 = crypto.randomUUID();
  const o2 = crypto.randomUUID();
  const o3 = crypto.randomUUID();
  const o4 = crypto.randomUUID();
  return {
    key: crypto.randomUUID(),
    prompt: "",
    score: 1,
    options: [
      { key: o1, text: "" },
      { key: o2, text: "" },
      { key: o3, text: "" },
      { key: o4, text: "" },
    ],
    correctKey: o1,
  };
}

export default function McqEditor(props: {
  questions: McqQuestionDraft[];
  setQuestions: React.Dispatch<React.SetStateAction<McqQuestionDraft[]>>;
}) {
  const { questions, setQuestions } = props;

  const totalScore = useMemo(
    () => questions.reduce((sum, q) => sum + (Number.isFinite(q.score) ? q.score : 0), 0),
    [questions]
  );

  function patchQuestion(key: string, patch: Partial<McqQuestionDraft>) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => prev.filter((q) => q.key !== key));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, makeDefaultQuestion()]);
  }

  function updateOption(qKey: string, optKey: string, text: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key !== qKey
          ? q
          : { ...q, options: q.options.map((o) => (o.key === optKey ? { ...o, text } : o)) }
      )
    );
  }

  function addOption(qKey: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key !== qKey ? q : { ...q, options: [...q.options, { key: crypto.randomUUID(), text: "" }] }
      )
    );
  }

  function removeOption(qKey: string, optKey: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.key !== qKey) return q;
        const next = q.options.filter((o) => o.key !== optKey);
        const nextCorrect = q.correctKey === optKey ? (next[0]?.key ?? "") : q.correctKey;
        return { ...q, options: next, correctKey: nextCorrect };
      })
    );
  }

  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-3">
        <div className="font-kanit text-base text-[#14532D]">
          ข้อสอบทั้งหมด: <span className="font-medium">{questions.length}</span> • คะแนนรวม:{" "}
          <span className="font-medium">{totalScore}</span>
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-4 py-2 font-kanit text-sm text-white shadow"
        >
          <Plus className="h-4 w-4" />
          เพิ่มข้อ
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {questions.map((q, idx) => (
          <McqQuestionItem
            key={q.key}
            index={idx + 1}
            q={q}
            onRemove={() => removeQuestion(q.key)}
            onPatch={(patch) => patchQuestion(q.key, patch)}
            onUpdateOption={(optKey, text) => updateOption(q.key, optKey, text)}
            onAddOption={() => addOption(q.key)}
            onRemoveOption={(optKey) => removeOption(q.key, optKey)}
          />
        ))}
      </div>
    </>
  );
}
