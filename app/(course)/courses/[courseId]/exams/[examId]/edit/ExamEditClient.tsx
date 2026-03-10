"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { ExamType } from "@prisma/client";

import ExamMetaForm from "@/components/Courses/Exams/forms/ExamMetaForm";
import McqEditor from "@/components/Courses/Exams/forms/McqEditor";
import WoodFillEditor from "@/components/Courses/Exams/forms/WoodFillEditor";

import type { McqQuestionDraft } from "@/components/Courses/Exams/forms/McqQuestionItem";
import type { WoodFillQuestionDraft } from "@/components/Courses/Exams/forms/WoodFillQuestionItem";
import type { ExamStatus } from "@/components/Courses/Exams/forms/ExamMetaForm";

export type ExamEditInitial = {
  courseId: string;
  examId: string;
  exam_title: string;
  exam_description: string;
  exam_type: ExamType;
  duration_minute: number;
  open_at: string | null;
  close_at: string | null;
  exam_status: ExamStatus;
  examAccessCode: string | null;
  questions: Array<{
    question_id: string;
    score: number;
    question_detail: string;
    choices: Array<{
      choice_id: string;
      choice_detail: string;
      is_correct: boolean;
    }>;
  }>;
};

function mcqFromDb(initial: ExamEditInitial): McqQuestionDraft[] {
  const qs = initial.questions.map((q) => {
    const opts = q.choices.map((c) => ({
      key: `c-${c.choice_id}`,
      text: c.choice_detail,
    }));
    const correct = q.choices.find((c) => c.is_correct) ?? q.choices[0];
    return {
      key: `q-${q.question_id}`,
      prompt: q.question_detail,
      score: q.score,
      options: opts,
      correctKey: correct ? `c-${correct.choice_id}` : (opts[0]?.key ?? ""),
    };
  });
  return qs.length
    ? qs
    : [
        {
          key: "q-0",
          prompt: "",
          score: 1,
          options: [
            { key: "c-0", text: "" },
            { key: "c-1", text: "" },
          ],
          correctKey: "c-0",
        },
      ];
}

function fillFromDb(initial: ExamEditInitial): WoodFillQuestionDraft[] {
  const qs = initial.questions.map((q) => ({
    key: `q-${q.question_id}`,
    woodName: q.question_detail,
    score: q.score,
    answerCodes: q.choices.map((c) => ({
      key: `c-${c.choice_id}`,
      code: c.choice_detail,
    })),
  }));
  return qs.length
    ? qs
    : [
        {
          key: "q-0",
          woodName: "",
          score: 1,
          answerCodes: [{ key: "c-0", code: "" }],
        },
      ];
}

function normalizeCode(v: string) {
  return v.trim().toUpperCase();
}

/** ตรวจว่า HTML มีเนื้อหา (ข้อความหรือรูปภาพ) */
function hasContent(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").trim();
  const hasImage = /<img[^>]+src/i.test(html);
  return text.length > 0 || hasImage;
}

export default function ExamEditClient({
  initial,
}: {
  initial: ExamEditInitial;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initial.exam_title);
  const [description, setDescription] = useState(
    initial.exam_description ?? "",
  );
  const [startDateTime, setStartDateTime] = useState<string>(() => {
    if (!initial.open_at) return "";
    return new Date(initial.open_at).toISOString().slice(0, 16);
  });
  const [endDateTime, setEndDateTime] = useState<string>(() => {
    if (!initial.close_at) return "";
    return new Date(initial.close_at).toISOString().slice(0, 16);
  });
  const [status, setStatus] = useState<ExamStatus>(initial.exam_status);
  const [accessCode, setAccessCode] = useState(initial.examAccessCode ?? "");

  const isFill = initial.exam_type === ExamType.FILL_IN_THE_BLANK;

  const [mcqQuestions, setMcqQuestions] = useState<McqQuestionDraft[]>(() =>
    mcqFromDb(initial),
  );
  const [fillQuestions, setFillQuestions] = useState<WoodFillQuestionDraft[]>(
    () => fillFromDb(initial),
  );

  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function doDelete() {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/courses/${initial.courseId}/exams/${initial.examId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "ลบไม่สำเร็จ");
      }

      router.push(`/courses/${initial.courseId}/exams`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "ลบไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  }

  async function onSave() {
    setError(null);

    const t = title.trim();
    if (!t) return setError("กรุณากรอกชื่อการสอบ");

    if (!startDateTime) return setError("กรุณากำหนดเวลาเริ่มสอบ");
    if (!endDateTime) return setError("กรุณากำหนดเวลาสิ้นสุดสอบ");
    if (new Date(endDateTime) <= new Date(startDateTime))
      return setError("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม");

    if (isFill) {
      if (fillQuestions.length === 0) return setError("ต้องมีอย่างน้อย 1 ข้อ");

      for (let i = 0; i < fillQuestions.length; i++) {
        const q = fillQuestions[i];
        if (!q.woodName.trim())
          return setError(`ข้อที่ ${i + 1}: กรุณากรอกชื่อพันธุ์ไม้/คำถาม`);
        if (!Number.isFinite(q.score) || q.score <= 0)
          return setError(`ข้อที่ ${i + 1}: คะแนนต้องมากกว่า 0`);

        const codes = Array.from(
          new Set(
            q.answerCodes.map((x) => normalizeCode(x.code)).filter(Boolean),
          ),
        );
        if (codes.length === 0)
          return setError(`ข้อที่ ${i + 1}: ต้องมีรหัสคำตอบอย่างน้อย 1 ค่า`);
      }
    } else {
      if (mcqQuestions.length === 0) return setError("ต้องมีอย่างน้อย 1 ข้อ");

      for (let i = 0; i < mcqQuestions.length; i++) {
        const q = mcqQuestions[i];
        if (!hasContent(q.prompt))
          return setError(`ข้อที่ ${i + 1}: กรุณากรอกคำถาม`);
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
    }

    const codeTrimmed = accessCode.trim();

    const payload = isFill
      ? {
          exam_title: t,
          exam_description: description.trim() || null,
          exam_type: ExamType.FILL_IN_THE_BLANK,
          open_at: new Date(startDateTime).toISOString(),
          close_at: new Date(endDateTime).toISOString(),
          exam_status: status,
          ...(codeTrimmed ? { exam_access_code: codeTrimmed } : {}),
          questions: fillQuestions.map((q) => {
            const codes = Array.from(
              new Set(
                q.answerCodes.map((x) => normalizeCode(x.code)).filter(Boolean),
              ),
            );
            return {
              score: Number(q.score),
              question_detail: q.woodName.trim(),
              choices: codes.map((c) => ({
                choice_detail: c,
                is_correct: true,
              })),
            };
          }),
        }
      : {
          exam_title: t,
          exam_description: description.trim() || null,
          exam_type: ExamType.MULTIPLE_CHOICE,
          open_at: new Date(startDateTime).toISOString(),
          close_at: new Date(endDateTime).toISOString(),
          exam_status: status,
          ...(codeTrimmed ? { exam_access_code: codeTrimmed } : {}),
          questions: mcqQuestions.map((q) => ({
            score: Number(q.score),
            question_detail: q.prompt,
            choices: q.options.map((o) => ({
              choice_detail: o.text.trim(),
              is_correct: o.key === q.correctKey,
            })),
          })),
        };

    setSaving(true);
    try {
      const res = await fetch(
        `/api/courses/${initial.courseId}/exams/${initial.examId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "บันทึกไม่สำเร็จ");
      }

      router.push(`/courses/${initial.courseId}/exams/${initial.examId}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/courses/${initial.courseId}/exams/${initial.examId}`,
              )
            }
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-[#14532D] shadow ring-1 ring-black/10"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้ารายละเอียด
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm text-white shadow hover:bg-red-700 disabled:opacity-60"
              title="ลบข้อสอบ"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? "กำลังลบ..." : "ลบข้อสอบ"}
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-2 text-sm text-white shadow disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          <div>
            <div className="text-2xl font-medium text-[#14532D]">
              แก้ไขข้อสอบ ({isFill ? "เติมคำตอบ" : "ปรนัย"})
            </div>
            <div className="mt-1 text-sm text-[#14532D]/70">
              แก้ไขสถานะ HIDE/SHOW และเนื้อหาข้อสอบ
            </div>
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-kanit text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <ExamMetaForm
            title={title}
            setTitle={setTitle}
            accessCode={accessCode}
            setAccessCode={setAccessCode}
            onRegenerateCode={() =>
              setAccessCode(String(Math.floor(100000 + Math.random() * 900000)))
            }
            description={description}
            setDescription={setDescription}
            startDateTime={startDateTime}
            setStartDateTime={setStartDateTime}
            endDateTime={endDateTime}
            setEndDateTime={setEndDateTime}
            status={status}
            setStatus={setStatus}
          />

          <div className="mt-6">
            {isFill ? (
              <WoodFillEditor
                questions={fillQuestions}
                setQuestions={setFillQuestions}
              />
            ) : (
              <McqEditor
                questions={mcqQuestions}
                setQuestions={setMcqQuestions}
              />
            )}
          </div>
        </section>
      </main>

      <ConfirmModal
        open={showDeleteConfirm}
        title="ลบข้อสอบ"
        description={`ยืนยันลบข้อสอบ "${title.trim() || initial.exam_title}" หรือไม่? การลบจะย้อนกลับไม่ได้`}
        confirmText="ลบข้อสอบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          doDelete();
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
