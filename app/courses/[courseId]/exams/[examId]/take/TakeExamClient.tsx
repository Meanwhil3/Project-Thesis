// app/courses/[courseId]/exams/[examId]/take/TakeExamClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight, Send, Flag } from "lucide-react";

type ExamType = "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK";

export type TakeExamChoice = {
  id: string;
  detail: string;
};

export type TakeExamQuestion = {
  id: string;
  detail: string;
  score: number;
  choices?: TakeExamChoice[]; // MCQ
};

export type TakeExamModel = {
  id: string;
  title: string;
  description?: string | null;
  examType: ExamType;
  durationMinute: number;
  questions: TakeExamQuestion[];
  startedAtISO?: string; // แนะนำให้ส่งมาจาก server ถ้ามี attempt
};

type SubmitResponse =
  | {
      ok: true;
      redirectTo?: string;
      score?: number;
      total?: number;
      message?: string;
    }
  | { ok: false; message: string };

export default function TakeExamClient({
  courseId,
  exam,
  submitEndpoint,
  backHref,
}: {
  courseId: string;
  exam: TakeExamModel;
  submitEndpoint?: string;
  backHref?: string; // กลับไปหน้ารายการ/หน้ากรอกรหัส
}) {
  const endpoint =
    submitEndpoint ?? `/api/courses/${courseId}/exams/${exam.id}/submit`;
  const back = backHref ?? `/courses/${courseId}/exams`;

  // ---- timer ----
  const startedAtMs = useMemo(
    () =>
      exam.startedAtISO ? new Date(exam.startedAtISO).getTime() : Date.now(),
    [exam.startedAtISO],
  );
  const endAtMs = useMemo(
    () => startedAtMs + exam.durationMinute * 60_000,
    [startedAtMs, exam.durationMinute],
  );

  const [nowMs, setNowMs] = useState(() => Date.now());
  const remainingMs = Math.max(0, endAtMs - nowMs);
  const remainingSec = Math.floor(remainingMs / 1000);

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);

  // ---- questions ----
  const questions = exam.questions ?? [];
  const [index, setIndex] = useState(0);
  const current = questions[index];

  // ---- trainee answers only ----
  // MCQ: answers[qid] = choiceId
  // FIB: answers[qid] = text
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const answeredCount = useMemo(() => {
    const ids = new Set(questions.map((q) => q.id));
    return Object.entries(answers).filter(
      ([qid, v]) => ids.has(qid) && String(v).trim().length > 0,
    ).length;
  }, [answers, questions]);

  const totalScore = useMemo(
    () => questions.reduce((sum, q) => sum + Number(q.score || 0), 0),
    [questions],
  );

  const storageKey = useMemo(
    () => `trainee-take:${courseId}:${exam.id}`,
    [courseId, exam.id],
  );

  // restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        answers?: Record<string, string>;
        flagged?: Record<string, boolean>;
        index?: number;
      };
      if (parsed.answers && typeof parsed.answers === "object")
        setAnswers(parsed.answers);
      if (parsed.flagged && typeof parsed.flagged === "object")
        setFlagged(parsed.flagged);
      if (typeof parsed.index === "number")
        setIndex(clamp(parsed.index, 0, questions.length - 1));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // save draft (debounce)
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ answers, flagged, index }),
        );
      } catch {
        // ignore
      }
    }, 200);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [answers, flagged, index, storageKey]);

  function setAnswer(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function toggleFlag(qid: string) {
    setFlagged((prev) => ({ ...prev, [qid]: !prev[qid] }));
  }

  function go(delta: number) {
    setIndex((i) => clamp(i + delta, 0, questions.length - 1));
    setServerMessage(null);
  }

  async function submit(opts?: { silent?: boolean }) {
    if (submitting) return;
    const silent = !!opts?.silent;

    if (!silent) {
      const unanswered = questions.length - answeredCount;
      const ok = window.confirm(
        unanswered > 0
          ? `คุณยังไม่ได้ตอบ ${unanswered} ข้อ — ต้องการส่งคำตอบเลยไหม?`
          : "ต้องการส่งคำตอบเลยไหม?",
      );
      if (!ok) return;
    }

    setSubmitting(true);
    setServerMessage(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseId,
          examId: exam.id,
          answers,
          clientSubmittedAt: new Date().toISOString(),
          isAuto: silent,
        }),
      });

      const data = (await res
        .json()
        .catch(() => null)) as SubmitResponse | null;

      if (!res.ok) {
        const msg =
          typeof (data as any)?.message === "string" &&
          (data as any).message.trim()
            ? (data as any).message
            : "ส่งคำตอบไม่สำเร็จ (server error)";

        setServerMessage(msg); // ✅ msg เป็น string แน่นอน
        if (!silent) alert(msg);
        return;
      }

      // clear draft
      try {
        localStorage.removeItem(storageKey);
      } catch {}

      if (data?.ok) {
        if (data.redirectTo) {
          window.location.assign(data.redirectTo);
          return;
        }

        const msg =
          data.score != null && data.total != null
            ? `ส่งสำเร็จ ✅ คะแนน ${data.score}/${data.total}`
            : (data.message ?? "ส่งคำตอบสำเร็จ ✅");
        setServerMessage(msg);
        if (!silent) alert(msg);
        return;
      }

      setServerMessage("ส่งคำตอบสำเร็จ ✅");
      if (!silent) alert("ส่งคำตอบสำเร็จ ✅");
    } catch {
      const msg = "ส่งคำตอบไม่สำเร็จ (network error)";
      setServerMessage(msg);
      if (!silent) alert(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // auto-submit when time up (once)
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (remainingMs > 0) return;
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    void submit({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-3xl border border-black/10 bg-white p-8 text-center text-sm text-[#14532D]/70">
          ไม่พบข้อสอบ / ไม่มีคำถาม
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
        {/* Header (TRAINEE ONLY) */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-[240px]">
            <div className="flex items-center gap-2">
              <Link
                href={back}
                className="rounded-xl border border-black/10 px-3 py-1.5 text-sm text-[#14532D] hover:bg-black/5"
              >
                ← กลับไปหน้าข้อสอบ
              </Link>
              <div className="text-xs text-[#14532D]/60">
                ตอบแล้ว {answeredCount}/{questions.length}
              </div>
            </div>

            <h1 className="mt-3 text-xl font-semibold text-[#14532D]">
              {exam.title}
            </h1>
            {exam.description ? (
              <p className="mt-1 text-sm text-[#14532D]/70">
                {exam.description}
              </p>
            ) : null}

            <div className="mt-2 text-xs text-[#14532D]/60">
              คะแนนรวม {totalScore}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-[#14532D]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">เหลือเวลา</span>
                <span className="font-semibold tabular-nums">
                  {formatTime(remainingSec)}
                </span>
              </div>
            </div>

            <button
              disabled={submitting}
              onClick={() => void submit({ silent: false })}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              ส่งคำตอบ
            </button>
          </div>
        </div>

        {serverMessage ? (
          <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#14532D]">
            {serverMessage}
          </div>
        ) : null}

        {/* Question navigator */}
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-[#14532D]">คำถาม</div>
            <div className="text-xs text-[#14532D]/60">คลิกเพื่อไปข้ออื่น</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => {
              const answered = !!answers[q.id]?.trim();
              const isFlagged = !!flagged[q.id];
              const active = i === index;

              return (
                <button
                  key={q.id}
                  onClick={() => setIndex(i)}
                  className={[
                    "h-9 min-w-9 rounded-xl border px-3 text-sm transition",
                    active
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-black/10 bg-white text-[#14532D] hover:bg-black/5",
                  ].join(" ")}
                  title={isFlagged ? "ปักธงไว้" : undefined}
                >
                  <span className="mr-2">{i + 1}</span>
                  <span
                    className={[
                      "inline-block h-2 w-2 rounded-full",
                      answered ? "bg-emerald-600" : "bg-black/20",
                    ].join(" ")}
                  />
                  {isFlagged ? (
                    <Flag className="ml-2 inline-block h-3.5 w-3.5 text-amber-600" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question */}
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-[#14532D]/70">
                ข้อ {index + 1} / {questions.length}
              </div>
              <div className="mt-1 text-base font-medium text-[#14532D]">
                {current.detail}
              </div>
            </div>
            <div className="text-xs text-[#14532D]/60">
              คะแนน {current.score}
            </div>
          </div>

          <div className="mt-4">
            {exam.examType === "MULTIPLE_CHOICE" ? (
              <div className="space-y-2">
                {(current.choices ?? []).map((c) => {
                  const checked = answers[current.id] === c.id;
                  return (
                    <label
                      key={c.id}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                        checked
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-black/10 bg-white hover:bg-black/5",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`q-${current.id}`}
                        checked={checked}
                        onChange={() => setAnswer(current.id, c.id)}
                        className="mt-0.5"
                      />
                      <div className="text-[#14532D]">{c.detail}</div>
                    </label>
                  );
                })}

                {(current.choices?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    ข้อสอบ MCQ แต่ไม่มีตัวเลือก — ตรวจสอบข้อมูลจาก server
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  value={answers[current.id] ?? ""}
                  onChange={(e) => setAnswer(current.id, e.target.value)}
                  placeholder="พิมพ์คำตอบของคุณ..."
                  className="h-11 w-full rounded-2xl border border-black/10 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25"
                />
                <div className="text-xs text-[#14532D]/60">
                  ตอบให้ตรงรูปแบบที่ผู้สอนกำหนด
                </div>
              </div>
            )}
          </div>

          {/* Actions (trainee) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => toggleFlag(current.id)}
              className={[
                "inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm",
                flagged[current.id]
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-black/10 bg-white text-[#14532D] hover:bg-black/5",
              ].join(" ")}
            >
              <Flag className="h-4 w-4" />
              {flagged[current.id] ? "ยกเลิกปักธง" : "ปักธง"}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => go(-1)}
                disabled={index === 0}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm text-[#14532D] hover:bg-black/5 disabled:opacity-60"
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </button>

              <button
                onClick={() => go(1)}
                disabled={index === questions.length - 1}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm text-[#14532D] hover:bg-black/5 disabled:opacity-60"
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-[#14532D]/60">
          ⏱️ หมดเวลาแล้วระบบจะส่งอัตโนมัติ (ถ้า submit API รองรับ)
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(totalSec: number) {
  const sec = Math.max(0, totalSec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
