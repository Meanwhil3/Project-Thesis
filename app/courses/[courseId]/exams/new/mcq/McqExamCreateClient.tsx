// app/courses/[courseId]/exams/new/mcq/McqExamCreateClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import ExamMetaForm from "@/components/Courses/Exams/forms/ExamMetaForm";
import McqEditor from "@/components/Courses/Exams/forms/McqEditor";

type ExamStatus = "HIDE" | "SHOW";
type StatusFilter = ExamStatus;

type McqOptionDraft = { key: string; text: string };
export type McqQuestionDraft = {
  key: string;
  prompt: string;
  score: number;
  options: McqOptionDraft[];
  correctKey: string;
};

function gen6Digits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function makeStableInitialQuestion(courseId: string): McqQuestionDraft {
  const qKey = `q-${courseId}-0`;
  const o1 = `${qKey}-o-0`;
  const o2 = `${qKey}-o-1`;
  const o3 = `${qKey}-o-2`;
  const o4 = `${qKey}-o-3`;

  return {
    key: qKey,
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

export default function McqExamCreateClient({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [accessCode, setAccessCode] = useState(""); // สุ่มหลัง mount กัน hydration mismatch
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [examDate, setExamDate] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("HIDE");

  const [questions, setQuestions] = useState<McqQuestionDraft[]>(() => [
    makeStableInitialQuestion(courseId),
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAccessCode(gen6Digits());
  }, []);

  const totalScore = useMemo(
    () =>
      questions.reduce(
        (sum, q) => sum + (Number.isFinite(q.score) ? q.score : 0),
        0,
      ),
    [questions],
  );

  async function onSave() {
    setError(null);

    const t = title.trim();
    if (!t) return setError("กรุณากรอกชื่อการสอบ");

    const code = accessCode.trim();
    if (!code) return setError("กำลังสร้างรหัสเข้าสอบ ลองใหม่อีกครั้ง");

    if (questions.length === 0) return setError("ต้องมีอย่างน้อย 1 ข้อ");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) return setError(`ข้อที่ ${i + 1}: กรุณากรอกคำถาม`);
      if (!Number.isFinite(q.score) || q.score <= 0)
        return setError(`ข้อที่ ${i + 1}: คะแนนต้องมากกว่า 0`);

      const cleaned = q.options.map((o) => ({ ...o, text: o.text.trim() }));
      if (cleaned.length < 2)
        return setError(`ข้อที่ ${i + 1}: ต้องมีตัวเลือกอย่างน้อย 2 ตัว`);
      if (cleaned.some((o) => !o.text))
        return setError(`ข้อที่ ${i + 1}: กรุณากรอกข้อความทุกตัวเลือก`);
      if (!cleaned.some((o) => o.key === q.correctKey))
        return setError(`ข้อที่ ${i + 1}: กรุณาเลือกคำตอบที่ถูกต้อง`);
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_title: t,
          exam_description: description.trim() || null,
          exam_type: "MULTIPLE_CHOICE",
          exam_status: status,

          duration_minute: Number(durationMinutes),

          questions: questions.map((q) => ({
            score: Number(q.score),
            question_detail: q.prompt.trim(),
            choices: q.options.map((o) => ({
              choice_detail: o.text.trim(),
              is_correct: o.key === q.correctKey,
            })),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "บันทึกไม่สำเร็จ");
      }

      router.push(`/courses/${courseId}/exams`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#F0FCF3_0%,#FEFBEB_100%)]">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push(`/courses/${courseId}/exams`)}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-kanit text-sm text-[#14532D] shadow ring-1 ring-black/10"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าการสอบ
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-2 font-kanit text-sm text-white shadow disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>

        <section className="mt-6 rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-kanit text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <ExamMetaForm
            title={title}
            setTitle={setTitle}
            accessCode={accessCode}
            setAccessCode={setAccessCode}
            onRegenerateCode={() => setAccessCode(gen6Digits())}
            description={description}
            setDescription={setDescription}
            examDate={examDate}
            setExamDate={setExamDate}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            status={status}
            setStatus={setStatus}
          />

          <div className="mt-8 font-kanit text-sm text-[#14532D]/70">
            ข้อสอบทั้งหมด: <b>{questions.length}</b> • คะแนนรวม:{" "}
            <b>{totalScore}</b>
          </div>

          <McqEditor questions={questions} setQuestions={setQuestions} />
        </section>
      </main>
    </div>
  );
}
