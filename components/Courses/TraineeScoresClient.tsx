"use client";

import { Trophy, FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export type TraineeExamScore = {
  examId: string;
  examTitle: string;
  score: number | null; // null = ยังไม่ได้ทำ
  maxScore: number;
  attempts: number;
  lastAttemptDate: string | null;
};

function formatThaiDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  const passed = pct >= 80;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0F7EB]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            passed ? "bg-[#16A34A]" : pct >= 50 ? "bg-amber-400" : "bg-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 font-kanit text-xs font-medium text-[#14532D]/60">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

export default function TraineeScoresClient({
  examScores,
  totalScore,
  totalMaxScore,
}: {
  examScores: TraineeExamScore[];
  totalScore: number;
  totalMaxScore: number;
}) {
  const totalPct = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  const passed = totalPct >= 80;
  const completedCount = examScores.filter((e) => e.score !== null).length;

  return (
    <section className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* คะแนนรวม */}
        <div className="relative overflow-hidden rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#DCFCE7]/60 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
              <Trophy className="h-6 w-6 text-[#14532D]" />
            </div>
            <div className="font-kanit">
              <div className="text-sm text-[#14532D]/70">คะแนนรวม</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-[#14532D]">
                  {totalScore}
                </span>
                <span className="text-lg text-[#14532D]/40">/</span>
                <span className="text-lg text-[#14532D]/60">{totalMaxScore}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ScoreBar score={totalScore} maxScore={totalMaxScore} />
          </div>
        </div>

        {/* สถานะ */}
        <div className="relative overflow-hidden rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#DCFCE7]/60 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-black/5 ${
              passed ? "bg-[#DCFCE7]" : "bg-amber-50"
            }`}>
              <TrendingUp className={`h-6 w-6 ${passed ? "text-[#14532D]" : "text-amber-600"}`} />
            </div>
            <div className="font-kanit">
              <div className="text-sm text-[#14532D]/70">สถานะ</div>
              <div className={`text-xl font-semibold ${
                passed ? "text-[#16A34A]" : "text-amber-600"
              }`}>
                {totalMaxScore === 0 ? "ยังไม่มีข้อสอบ" : passed ? "ผ่านเกณฑ์" : "ยังไม่ผ่านเกณฑ์"}
              </div>
            </div>
          </div>
          <p className="mt-3 font-kanit text-xs text-[#14532D]/50">
            เกณฑ์ผ่าน: 80% ของคะแนนรวม
          </p>
        </div>

        {/* ข้อสอบที่ทำแล้ว */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#DCFCE7]/60 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
              <FileText className="h-6 w-6 text-[#14532D]" />
            </div>
            <div className="font-kanit">
              <div className="text-sm text-[#14532D]/70">ข้อสอบที่ทำแล้ว</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-[#14532D]">
                  {completedCount}
                </span>
                <span className="text-lg text-[#14532D]/40">/</span>
                <span className="text-lg text-[#14532D]/60">{examScores.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Exam Score List ── */}
      <div className="rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
            <FileText className="h-6 w-6 text-[#14532D]" />
          </div>
          <h2 className="font-kanit text-[22px] font-medium text-[#14532D]">
            คะแนนแต่ละข้อสอบ
          </h2>
        </div>

        {examScores.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#CDE3BD] bg-white p-8 text-center font-kanit text-sm text-[#6E8E59]">
            ยังไม่มีข้อสอบในคอร์สนี้
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {examScores.map((es) => {
              const done = es.score !== null;
              const pct = done && es.maxScore > 0 ? (es.score! / es.maxScore) * 100 : 0;
              const examPassed = pct >= 80;

              return (
                <div
                  key={es.examId}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-[0_0_4px_0_#CAE0BC] transition hover:shadow-[0_4px_16px_rgba(20,83,45,0.1)]"
                >
                  {/* Row 1: Icon + Title + Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 ${
                        !done
                          ? "bg-gray-100"
                          : examPassed
                            ? "bg-[#DCFCE7]"
                            : "bg-amber-50"
                      }`}>
                        {done ? (
                          <CheckCircle2 className={`h-5 w-5 ${examPassed ? "text-[#16A34A]" : "text-amber-500"}`} />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-kanit text-[15px] font-medium text-[#14532D]">
                          {es.examTitle}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-kanit text-xs text-[#14532D]/50">
                          {done ? (
                            <>
                              <span>ทำแล้ว {es.attempts} ครั้ง</span>
                              {es.lastAttemptDate && (
                                <span>ล่าสุด: {formatThaiDate(es.lastAttemptDate)}</span>
                              )}
                            </>
                          ) : (
                            <span>ยังไม่ได้ทำข้อสอบ</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {done ? (
                      <span className={`shrink-0 rounded-full px-2.5 py-1 font-kanit text-xs font-medium ${
                        examPassed
                          ? "bg-[#DCFCE7] text-[#16A34A]"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {examPassed ? "ผ่าน" : "ไม่ผ่าน"}
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-kanit text-xs font-medium text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        รอทำ
                      </span>
                    )}
                  </div>

                  {/* Row 2: Score bar (เฉพาะเมื่อทำแล้ว) */}
                  {done && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1">
                        <ScoreBar score={es.score!} maxScore={es.maxScore} />
                      </div>
                      <span className="shrink-0 inline-flex items-baseline gap-1 font-kanit text-sm">
                        <span className="font-semibold text-[#14532D]">{es.score}</span>
                        <span className="text-[#14532D]/40">/</span>
                        <span className="text-[#14532D]/60">{es.maxScore}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Note */}
        <div className="mt-6 rounded-2xl bg-[#F8FFF9] p-4 font-kanit text-[12px] text-[#6E8E59] ring-1 ring-[#BBF7D0]/60">
          เกณฑ์ผ่าน ≥ 80%
        </div>
      </div>
    </section>
  );
}
