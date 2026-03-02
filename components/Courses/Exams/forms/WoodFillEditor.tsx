// components/Courses/Exams/forms/WoodFillEditor.tsx
"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import WoodFillQuestionItem, {
  type WoodFillQuestionDraft,
} from "./WoodFillQuestionItem";

function makeDefaultQuestion(): WoodFillQuestionDraft {
  return {
    key: crypto.randomUUID(),
    woodName: "",
    score: 1,
    answerCodes: [{ key: crypto.randomUUID(), code: "" }],
  };
}

export default function WoodFillEditor(props: {
  questions: WoodFillQuestionDraft[];
  setQuestions: React.Dispatch<React.SetStateAction<WoodFillQuestionDraft[]>>;
}) {
  const { questions, setQuestions } = props;

  const totalScore = useMemo(
    () =>
      questions.reduce(
        (sum, q) => sum + (Number.isFinite(q.score) ? q.score : 0),
        0
      ),
    [questions]
  );

  function patchQuestion(key: string, patch: Partial<WoodFillQuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q) => (q.key === key ? { ...q, ...patch } : q))
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, makeDefaultQuestion()]);
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => prev.filter((q) => q.key !== key));
  }

  function addCode(qKey: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key !== qKey
          ? q
          : {
              ...q,
              answerCodes: [...q.answerCodes, { key: crypto.randomUUID(), code: "" }],
            }
      )
    );
  }

  function updateCode(qKey: string, codeKey: string, value: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key !== qKey
          ? q
          : {
              ...q,
              answerCodes: q.answerCodes.map((c) =>
                c.key === codeKey ? { ...c, code: value } : c
              ),
            }
      )
    );
  }

  function removeCode(qKey: string, codeKey: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.key !== qKey) return q;
        const next = q.answerCodes.filter((c) => c.key !== codeKey);
        return { ...q, answerCodes: next.length ? next : q.answerCodes };
      })
    );
  }

  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-3">
        <div className="font-kanit text-base text-[#14532D]">
          ข้อสอบทั้งหมด: <span className="font-medium">{questions.length}</span>{" "}
          • คะแนนรวม: <span className="font-medium">{totalScore}</span>
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
          <WoodFillQuestionItem
            key={q.key}
            index={idx + 1}
            q={q}
            onRemove={() => removeQuestion(q.key)}
            onPatch={(patch) => patchQuestion(q.key, patch)}
            onAddCode={() => addCode(q.key)}
            onUpdateCode={(codeKey, value) => updateCode(q.key, codeKey, value)}
            onRemoveCode={(codeKey) => removeCode(q.key, codeKey)}
          />
        ))}
      </div>
    </>
  );
}
