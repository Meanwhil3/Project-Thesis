// app/courses/[courseId]/exams/[examId]/take/TakeExamClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import ConfirmModal from "@/components/modals/ConfirmModal";

export type TakeExamQuestion = {
  id: string;
  detail: string;
  score: number;
  choices?: { id: string; detail: string }[];
};

export type TakeExamModel = {
  attemptId: string;
  id: string;
  title: string;
  description: string | null;
  examType: string; // "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK"
  deadlineISO: string;
  questions: TakeExamQuestion[];
};

type SubmitResponse =
  | { ok: true; score: number; total: number }
  | { ok: false; message: string };

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; score: number; total: number }
  | { status: "error"; message: string };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatLeft(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return hh > 0
    ? `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`
    : `${pad2(mm)}:${pad2(ss)}`;
}

function safeLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export default function TakeExamClient({
  courseId,
  exam,
  backHref,
  submitEndpoint,
}: {
  courseId: string;
  exam: TakeExamModel;
  backHref: string;
  submitEndpoint: string;
}) {
  const storageKey = `exam_answers:${exam.attemptId}`;
  const deadlineMs = useMemo(
    () => new Date(exam.deadlineISO).getTime(),
    [exam.deadlineISO],
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [mounted, setMounted] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const autoSubmitOnceRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── โหลด draft จาก localStorage หลัง hydration เสร็จ ───────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      const raw = safeLocalStorage()?.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setAnswers(parsed);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locked =
    submitState.status === "success" || submitState.status === "submitting";

  // ─── Debounced localStorage save ────────────────────────────────────────────
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        safeLocalStorage()?.setItem(storageKey, JSON.stringify(answers));
      } catch {}
    }, 300);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [answers, storageKey]);

  // ─── Timer tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const leftMs = deadlineMs - nowMs;

  // ─── Submit function ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (silent?: boolean) => {
      if (submitState.status === "submitting" || submitState.status === "success") return;

      setSubmitState({ status: "submitting" });

      try {
        const res = await fetch(submitEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });

        const data = (await res.json().catch(() => null)) as SubmitResponse | null;

        if (!res.ok || !data?.ok) {
          const msg =
            (data && "message" in data && typeof data.message === "string" && data.message) ||
            "ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่";
          setSubmitState({ status: "error", message: msg });
          return;
        }

        // สำเร็จ
        try {
          safeLocalStorage()?.removeItem(storageKey);
        } catch {}
        setSubmitState({ status: "success", score: data.score, total: data.total });
      } catch {
        setSubmitState({
          status: "error",
          message: "เครือข่ายมีปัญหา กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, submitEndpoint, submitState.status],
  );

  // ─── Auto-submit เมื่อหมดเวลา ────────────────────────────────────────────────
  useEffect(() => {
    if (leftMs > 0) return;
    if (autoSubmitOnceRef.current) return;
    if (submitState.status === "success") return;
    autoSubmitOnceRef.current = true;
    void handleSubmit(true);
  }, [leftMs, handleSubmit, submitState.status]);

  // ─── Warn ก่อนออกจากหน้า ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submitState.status !== "success" && leftMs > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [submitState.status, leftMs]);

  const answeredCount = Object.values(answers).filter((v) => v.trim() !== "").length;
  const totalQuestions = exam.questions.length;
  const isLowTime = leftMs > 0 && leftMs <= 5 * 60 * 1000; // น้อยกว่า 5 นาที

  const timerNode = mounted ? document.getElementById("exam-timer-slot") : null;

  const timerEl = (
    <div
      className={`rounded-xl border px-4 py-2 text-center shadow-sm backdrop-blur transition-colors ${
        leftMs <= 0
          ? "border-red-200 bg-red-50"
          : isLowTime
          ? "border-amber-200 bg-amber-50"
          : "border-black/10 bg-white/80"
      }`}
    >
      <div className="text-[10px] leading-none text-[#14532D]/50">เวลาเหลือ</div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums leading-none tracking-tight ${
          leftMs <= 0
            ? "text-red-600"
            : isLowTime
            ? "text-amber-600"
            : "text-[#14532D]"
        }`}
      >
        {leftMs <= 0 ? "หมดเวลา" : formatLeft(leftMs)}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      {timerNode && createPortal(timerEl, timerNode)}

      {/* ─── Header card ─────────────────────────────────────────────────────── */}
      <div className="mb-4 rounded-2xl border border-black/10 bg-white/90 p-5 shadow-sm ring-1 ring-black/5">
        <h1 className="text-xl font-semibold text-[#14532D] sm:text-2xl">
          {exam.title}
        </h1>
        {exam.description && (
          <p className="mt-1 text-sm text-[#14532D]/60">{exam.description}</p>
        )}

        {/* Progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#14532D]/60">
            <span>ความคืบหน้า</span>
            <span className="font-medium text-[#14532D]/80">
              {answeredCount}/{totalQuestions} ข้อ
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/8">
            <div
              className="h-full rounded-full bg-[#4CA771] transition-all duration-300"
              style={{
                width: totalQuestions > 0
                  ? `${(answeredCount / totalQuestions) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── Success banner ───────────────────────────────────────────────────── */}
      {submitState.status === "success" && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="text-sm font-medium text-emerald-800">
            ส่งคำตอบสำเร็จ คุณสามารถดูคะแนนได้ด้านล่าง
          </div>
          <div className="mt-1 text-sm text-emerald-700">
            คะแนนที่ได้:{" "}
            <span className="font-semibold">
              {submitState.score}/{submitState.total}
            </span>
          </div>
          <Link
            href={backHref}
            className="mt-3 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            กลับหน้าข้อสอบ
          </Link>
        </div>
      )}

      {/* ─── Error banner ─────────────────────────────────────────────────────── */}
      {submitState.status === "error" && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="text-sm font-medium text-red-700">⚠️ {submitState.message}</div>
          <button
            onClick={() => setSubmitState({ status: "idle" })}
            className="mt-2 text-xs text-red-600 underline"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* ─── Questions ────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {exam.questions.map((q, idx) => {
          const value = answers[q.id] ?? "";
          const isMcq = Array.isArray(q.choices) && q.choices.length > 0;
          const isAnswered = value.trim() !== "";

          return (
            <div
              key={q.id}
              className={`rounded-2xl border bg-white p-5 transition-shadow ${
                isAnswered ? "border-[#4CA771]/30" : "border-black/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isAnswered
                        ? "bg-[#14532D] text-white"
                        : "bg-black/10 text-[#14532D]/70"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs text-[#14532D]/60">{q.score} คะแนน</span>
                </div>
              </div>

              <div
                className="question-html mt-3 text-sm leading-relaxed text-[#14532D]/90"
                dangerouslySetInnerHTML={{ __html: q.detail }}
              />

              <div className="mt-4">
                {isMcq ? (
                  <fieldset>
                    <legend className="sr-only">คำตอบข้อ {idx + 1}</legend>
                    <div className="space-y-2">
                      {q.choices!.map((c) => (
                        <label
                          key={c.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                            value === c.id
                              ? "border-[#4CA771] bg-[#4CA771]/10"
                              : "border-black/10 hover:bg-black/5"
                          } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={c.id}
                            checked={value === c.id}
                            disabled={locked}
                            onChange={() =>
                              !locked &&
                              setAnswers((prev) => ({ ...prev, [q.id]: c.id }))
                            }
                            className="mt-0.5 accent-[#14532D]"
                          />
                          <span className="text-sm text-[#14532D]/85">{c.detail}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <input
                    value={value}
                    disabled={locked}
                    onChange={(e) =>
                      !locked &&
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="พิมพ์คำตอบ..."
                    className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Footer actions ───────────────────────────────────────────────────── */}
      {submitState.status !== "success" && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#14532D] hover:bg-black/5"
            onClick={(e) => {
              if (leftMs > 0) {
                e.preventDefault();
                setShowLeaveConfirm(true);
              }
            }}
          >
            กลับ
          </Link>

          <div className="flex items-center gap-3">
            {answeredCount < totalQuestions && submitState.status === "idle" && (
              <span className="text-xs text-[#14532D]/50">
                ยังตอบไม่ครบ ({totalQuestions - answeredCount} ข้อ)
              </span>
            )}
            <button
              onClick={() => handleSubmit(false)}
              disabled={locked}
              className="h-11 rounded-xl bg-emerald-600 px-6 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState.status === "submitting"
                ? "กำลังส่ง..."
                : leftMs <= 0
                ? "ส่งอัตโนมัติ..."
                : "ส่งคำตอบ"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Back to top ──────────────────────────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="กลับขึ้นด้านบน"
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#14532D] text-white shadow-lg transition hover:bg-[#166534] active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      <ConfirmModal
        open={showLeaveConfirm}
        title="ออกจากข้อสอบ"
        description="คุณต้องการออกจากข้อสอบหรือไม่? คำตอบจะถูกบันทึกชั่วคราว"
        confirmText="ออก"
        cancelText="ทำต่อ"
        variant="warning"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          window.location.href = backHref;
        }}
        onClose={() => setShowLeaveConfirm(false)}
      />
    </div>
  );
}