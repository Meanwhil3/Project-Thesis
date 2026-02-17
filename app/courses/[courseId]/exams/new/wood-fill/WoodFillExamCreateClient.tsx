// app/courses/[courseId]/exams/new/wood-fill/WoodFillExamCreateClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import ExamMetaForm, { type ExamStatus } from "@/components/Courses/Exams/forms/ExamMetaForm";
import WoodFillEditor from "@/components/Courses/Exams/forms/WoodFillEditor";
import type { WoodFillQuestionDraft } from "@/components/Courses/Exams/forms/WoodFillQuestionItem";

function gen6Digits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function makeStableInitialQuestion(courseId: string): WoodFillQuestionDraft {
  const qKey = `wf-${courseId}-0`;
  return {
    key: qKey,
    woodName: "",
    score: 1,
    answerCodes: [{ key: `${qKey}-c-0`, code: "" }],
  };
}

function normalizeCode(v: string) {
  // ปรับได้ตามต้องการ: case-insensitive
  return v.trim().toUpperCase();
}

export default function WoodFillExamCreateClient({ courseId }: { courseId: string }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [accessCode, setAccessCode] = useState(""); // ✅ สุ่มหลัง mount (กัน hydration mismatch)
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [examDate, setExamDate] = useState<string>(""); // UI-only (DB ยังไม่เก็บ)
  const [status, setStatus] = useState<ExamStatus>("HIDE");

  const [questions, setQuestions] = useState<WoodFillQuestionDraft[]>(() => [
    makeStableInitialQuestion(courseId),
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAccessCode(gen6Digits());
  }, []);

  async function onSave() {
    setError(null);

    const t = title.trim();
    if (!t) return setError("กรุณากรอกชื่อการสอบ");

    const code = accessCode.trim();
    if (!code) return setError("กำลังสร้างรหัสเข้าสอบ ลองใหม่อีกครั้ง");

    if (questions.length === 0) return setError("ต้องมีอย่างน้อย 1 ข้อ");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.woodName.trim()) return setError(`ข้อที่ ${i + 1}: กรุณากรอกชื่อพันธุ์ไม้/คำถาม`);
      if (!Number.isFinite(q.score) || q.score <= 0) return setError(`ข้อที่ ${i + 1}: คะแนนต้องมากกว่า 0`);

      const codes = Array.from(
        new Set(q.answerCodes.map((x) => normalizeCode(x.code)).filter(Boolean))
      );

      if (codes.length === 0) return setError(`ข้อที่ ${i + 1}: ต้องมีรหัสคำตอบอย่างน้อย 1 ค่า`);
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ ส่งให้ตรง DB + enum จริง
        body: JSON.stringify({
          exam_title: t,
          exam_description: description.trim() || null,
          exam_type: "FILL_IN_THE_BLANK",
          duration_minute: Number(durationMinutes),
          exam_status: status,

          questions: questions.map((q) => {
            const codes = Array.from(
              new Set(q.answerCodes.map((x) => normalizeCode(x.code)).filter(Boolean))
            );

            return {
              score: Number(q.score),
              question_detail: q.woodName.trim(),
              // ✅ เก็บรหัสคำตอบเป็น choices ทั้งหมด (ถูกต้องทั้งหมด)
              choices: codes.map((c) => ({
                choice_detail: c,
                is_correct: true,
              })),
            };
          }),

          // accessCode / examDate ยังไม่เก็บใน DB -> ไม่ส่ง
          // ถ้าจะเก็บจริงต้องเพิ่ม column ใน DB
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
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-[#14532D] shadow ring-1 ring-black/10"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าการสอบ
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-2 text-sm text-white shadow disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>

        <section className="mt-6 rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          <div>
            <div className="text-2xl font-medium text-[#14532D]">สร้างข้อสอบ: เติมข้อมูลพันธุ์ไม้</div>
            <div className="mt-1 text-sm text-[#14532D]/70">กำหนดชื่อพันธุ์ไม้ + รหัสคำตอบที่ยอมรับได้ + คะแนน</div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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

          <WoodFillEditor questions={questions} setQuestions={setQuestions} />
        </section>
      </main>
    </div>
  );
}
