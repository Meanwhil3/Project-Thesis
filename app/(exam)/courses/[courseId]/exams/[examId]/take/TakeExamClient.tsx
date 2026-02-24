// app/courses/[courseId]/exams/[examId]/take/TakeExamClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

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
  durationMinute: number;
  startedAtISO: string;
  deadlineISO: string;
  questions: TakeExamQuestion[];
};

type SubmitResponse =
  | { ok: true; score: number; total: number }
  | { ok: false; message: string };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatLeft(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return hh > 0 ? `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}` : `${pad2(mm)}:${pad2(ss)}`;
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
  const storageKey = `takeExamAnswers:${exam.attemptId}`;
  const deadlineMs = useMemo(() => new Date(exam.deadlineISO).getTime(), [exam.deadlineISO]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [locked, setLocked] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const autoSubmitOnceRef = useRef(false);

  // ✅ โหลดคำตอบที่ค้างจาก localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setAnswers(parsed);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // ✅ เซฟคำตอบลง localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {}
  }, [answers, storageKey]);

  // ✅ timer tick
  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const leftMs = deadlineMs - nowMs;

  // ✅ lock เมื่อหมดเวลา
  useEffect(() => {
    if (leftMs > 0) return;
    setLocked(true);

    // auto-submit 1 ครั้ง (ถ้ายังไม่ได้กดส่ง)
    if (autoSubmitOnceRef.current) return;
    autoSubmitOnceRef.current = true;

    void handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftMs]);

  async function handleSubmit(silent?: boolean) {
    if (submitting) return;
    setSubmitting(true);
    setServerMessage(null);

    try {
      const res = await fetch(submitEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = (await res.json().catch(() => null)) as SubmitResponse | null;

      if (!res.ok) {
        const msg =
          (data && "message" in data && typeof data.message === "string" && data.message) ||
          "ส่งคำตอบไม่สำเร็จ";
        setServerMessage(msg);
        if (!silent) alert(msg);
        return;
      }

      if (data && data.ok) {
        const msg = `ส่งสำเร็จ ✅ คะแนน ${data.score}/${data.total}`;
        setServerMessage(msg);
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        if (!silent) alert(msg);
        setLocked(true);
      } else {
        const msg =
          (data && "message" in data && typeof data.message === "string" && data.message) ||
          "ส่งคำตอบไม่สำเร็จ";
        setServerMessage(msg);
        if (!silent) alert(msg);
      }
    } catch (e) {
      const msg = "เครือข่ายมีปัญหา กรุณาลองใหม่";
      setServerMessage(msg);
      if (!silent) alert(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="rounded-3xl bg-white/90 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-[#14532D]">{exam.title}</div>
            {exam.description ? (
              <div className="mt-2 text-sm text-[#14532D]/70">{exam.description}</div>
            ) : null}
            <div className="mt-2 text-xs text-[#14532D]/60">
              Attempt: <span className="font-medium">{exam.attemptId}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-right">
            <div className="text-xs text-[#14532D]/60">เวลาเหลือ</div>
            <div className={`mt-1 text-2xl font-semibold ${leftMs <= 0 ? "text-red-600" : "text-[#14532D]"}`}>
              {formatLeft(leftMs)}
            </div>
            <div className="mt-1 text-[11px] text-[#14532D]/50">
              หมดเวลา:{" "}
              {new Date(exam.deadlineISO).toLocaleString("th-TH", {
                timeZone: "Asia/Bangkok",
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {serverMessage ? (
          <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#14532D]/80">
            {serverMessage}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {exam.questions.map((q, idx) => {
            const value = answers[q.id] ?? "";
            const isMcq = Array.isArray(q.choices) && q.choices.length > 0;

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-black/10 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium text-[#14532D]">
                    ข้อ {idx + 1}
                  </div>
                  <div className="text-xs text-[#14532D]/60">
                    {q.score} คะแนน
                  </div>
                </div>

                <div className="mt-2 whitespace-pre-wrap text-sm text-[#14532D]/90">
                  {q.detail}
                </div>

                <div className="mt-4">
                  {isMcq ? (
                    <div className="space-y-2">
                      {q.choices!.map((c) => (
                        <label
                          key={c.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 px-3 py-2 hover:bg-black/5 ${
                            locked ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={c.id}
                            checked={value === c.id}
                            disabled={locked}
                            onChange={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: c.id }))
                            }
                            className="mt-1"
                          />
                          <span className="text-sm text-[#14532D]/85">{c.detail}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      value={value}
                      disabled={locked}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="พิมพ์คำตอบ..."
                      className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25 disabled:opacity-60"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#14532D] hover:bg-black/5"
          >
            กลับ
          </Link>

          <button
            onClick={() => handleSubmit(false)}
            disabled={locked || submitting}
            className="h-11 rounded-xl bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "กำลังส่ง..." : locked ? "หมดเวลาแล้ว" : "ส่งคำตอบ"}
          </button>
        </div>
      </div>
    </div>
  );
}
