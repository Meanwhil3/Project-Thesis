"use client";

import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import ConfirmModal from "@/components/modals/ConfirmModal";

import FilterSelect, { type SelectOption } from "@/components/ui/FilterSelect";

export type ExamScore = {
  examId: string;
  examTitle: string;
  score: number;
  maxScore: number;
};

export type MemberModel = {
  id: string;           // user_id
  enrollmentId: string; // enrollment_id (ใช้สำหรับ delete)
  name: string;
  email: string;
  score: number;
  maxScore: number;
  examScores: ExamScore[];
};

type SortKey = "score_desc" | "score_asc";

const sortOptions: ReadonlyArray<SelectOption<SortKey>> = [
  { value: "score_desc", label: "คะแนน: มาก → น้อย" },
  { value: "score_asc", label: "คะแนน: น้อย → มาก" },
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildPagination(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | "..."> = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

function toCsv(
  rows: Record<string, string | number>[],
  headers?: string[],
) {
  const cols = headers ?? Object.keys(rows[0] ?? {});

  const escape = (v: string | number) => {
    const s = String(v ?? "");
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines = [
    cols.join(","),
    ...rows.map((r) => cols.map((h) => escape(r[h] ?? "")).join(",")),
  ];
  return "\uFEFF" + lines.join("\n");
}

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2)
    return parts[1]?.[0]?.toUpperCase() ?? parts[0][0].toUpperCase();
  return name[0]?.toUpperCase() ?? "?";
}

export default function MembersClient({
  courseId,
  initialMembers,
  canManage = true,
}: {
  courseId: string;
  initialMembers: MemberModel[];
  canManage?: boolean;
}) {
  const [members, setMembers] = useState<MemberModel[]>(initialMembers);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("score_desc");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<MemberModel | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
  const pageSize = 5;

  const filteredSorted = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = members.filter((m) => {
      if (!query) return true;
      return (
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
      );
    });
    const sorted = [...filtered].sort((a, b) => {
      const av = a.score / Math.max(1, a.maxScore);
      const bv = b.score / Math.max(1, b.maxScore);
      return sort === "score_desc" ? bv - av : av - bv;
    });
    return sorted;
  }, [members, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const currentPage = clamp(page, 1, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, currentPage]);

  if (page !== currentPage) setPage(currentPage);

  const pagination = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages],
  );

  // Collect all unique exams across all members
  const allExams = useMemo(() => {
    const map = new Map<string, { examId: string; examTitle: string; maxScore: number }>();
    for (const m of members) {
      for (const es of m.examScores) {
        if (!map.has(es.examId)) {
          map.set(es.examId, { examId: es.examId, examTitle: es.examTitle, maxScore: es.maxScore });
        }
      }
    }
    return Array.from(map.values());
  }, [members]);

  const openCsvModal = useCallback(() => {
    setSelectedExams(new Set(allExams.map((e) => e.examId)));
    setCsvModalOpen(true);
  }, [allExams]);

  const onExportCsv = useCallback(() => {
    const colKey = (es: { examTitle: string; maxScore: number }) =>
      `${es.examTitle} (${es.maxScore})`;

    const selectedExamList = allExams.filter((e) => selectedExams.has(e.examId));

    const examCols = selectedExamList.map(colKey);
    const selectedMaxTotal = selectedExamList.reduce((s, e) => s + e.maxScore, 0);
    const totalCol = `คะแนนรวม (${selectedMaxTotal})`;
    const pctCol = "ร้อยละ";
    const passCol = "ผ่าน/ไม่ผ่าน";
    const headers = ["name", "email", ...examCols, totalCol, pctCol, passCol];

    const rows = filteredSorted.map((m) => {
      const row: Record<string, string | number> = {
        name: m.name,
        email: m.email,
      };

      for (const t of examCols) row[t] = "";

      let totalScore = 0;
      for (const es of m.examScores) {
        if (selectedExams.has(es.examId)) {
          row[colKey(es)] = `${es.score}`;
          totalScore += es.score;
        }
      }
      row[totalCol] = `${totalScore}`;
      row[pctCol] = selectedMaxTotal > 0
        ? `${((totalScore / selectedMaxTotal) * 100).toFixed(2)}`
        : "0.00";
      row[passCol] = totalScore >= selectedMaxTotal * 0.8 ? "ผ่าน" : "ไม่ผ่าน";
      return row;
    });

    if (rows.length === 0) {
      const emptyRow: Record<string, string | number> = { name: "", email: "" };
      for (const t of examCols) emptyRow[t] = "";
      emptyRow[totalCol] = "";
      emptyRow[pctCol] = "";
      emptyRow[passCol] = "";
      rows.push(emptyRow);
    }

    downloadTextFile(
      `course-${courseId}-members.csv`,
      toCsv(rows, headers),
      "text/csv;charset=utf-8",
    );
    setCsvModalOpen(false);
  }, [filteredSorted, allExams, selectedExams, courseId]);

  async function doDelete(m: MemberModel) {
    setDeletingId(m.enrollmentId);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/members/${m.enrollmentId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "ลบสมาชิกไม่สำเร็จ");
        return;
      }
      setMembers((prev) => prev.filter((x) => x.enrollmentId !== m.enrollmentId));
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-green-50">
              <Users className="h-5 w-5 text-green-800" />
            </div>
            <h1 className="font-kanit text-2xl font-medium text-[#14532D]">
              จัดการสมาชิก
            </h1>
          </div>
          <p className="mt-1 font-kanit text-sm text-[#14532D]/70">
            สมาชิกทั้งหมด{" "}
            <span className="font-semibold text-[#14532D]">{members.length}</span>{" "}
            คน
          </p>
        </div>

        <button
          type="button"
          onClick={openCsvModal}
          className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-2 font-kanit text-sm text-white shadow hover:bg-[#166534] active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          บันทึกเป็น CSV
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4CA771]" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาด้วยชื่อ หรืออีเมล"
            className="h-11 w-full rounded-xl border border-black/10 pl-10 pr-4 font-kanit text-sm text-[#14532D] outline-none placeholder:text-[#14532D]/40 focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
          />
        </div>

        <FilterSelect<SortKey>
          value={sort}
          onValueChange={(v) => {
            setSort(v);
            setPage(1);
          }}
          placeholder="เรียงตามคะแนน"
          options={sortOptions}
          containerClassName="w-full sm:w-[220px]"
          triggerClassName="
            group inline-flex h-11 w-full items-center justify-between gap-3
            rounded-xl border border-black/10 bg-white px-4 text-sm
            font-kanit text-[#14532D] shadow-sm outline-none transition
            focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25
            disabled:bg-gray-50 disabled:opacity-60
          "
          contentClassName="
            z-[200] w-[var(--radix-select-trigger-width)]
            overflow-hidden rounded-xl border border-black/10
            bg-white shadow-lg
          "
        />
      </div>

      {/* ── Table header ── */}
      <div className="mt-5 hidden rounded-xl bg-[#F0FDF4] px-5 py-3 sm:block">
        <div className="grid grid-cols-12 items-center gap-3 font-kanit text-sm font-medium text-[#14532D]/70">
          <div className="col-span-5">ชื่อสมาชิก</div>
          <div className={canManage ? "col-span-4" : "col-span-5"}>อีเมล</div>
          <div className="col-span-2 text-center">คะแนนรวม</div>
          {canManage && <div className="col-span-1 text-center">จัดการ</div>}
        </div>
      </div>

      {/* ── Rows ── */}
      <div className="mt-2 space-y-2">
        {pageItems.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-10 text-center font-kanit text-sm text-[#14532D]/60">
            {members.length === 0
              ? "ยังไม่มีสมาชิกในคอร์สนี้"
              : "ไม่พบสมาชิกที่ตรงกับคำค้นหา"}
          </div>
        ) : (
          pageItems.map((m) => {
            const isDeleting = deletingId === m.enrollmentId;
            const isExpanded = expandedId === m.enrollmentId;
            return (
              <div
                key={m.enrollmentId}
                className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_0_4px_0_#CAE0BC] transition hover:shadow-[0_4px_16px_rgba(20,83,45,0.1)] ${
                  isDeleting ? "opacity-50" : ""
                }`}
              >
                {/* ── Main row ── */}
                <div
                  className="grid cursor-pointer grid-cols-12 items-center gap-3 px-5 py-3.5"
                  onClick={() => setExpandedId(isExpanded ? null : m.enrollmentId)}
                >
                  {/* Expand indicator + Name + avatar */}
                  <div className="col-span-12 flex items-center gap-3 sm:col-span-5">
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#14532D]/40 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#DCFCE7] font-kanit text-sm font-semibold text-[#14532D]">
                      {getInitials(m.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-kanit text-sm font-medium text-[#14532D]">
                        {m.name}
                      </div>
                      <div className="truncate font-kanit text-xs text-[#4CA771] sm:hidden">
                        {m.email}
                      </div>
                    </div>
                  </div>

                  {/* Email (desktop) */}
                  <div className="col-span-4 hidden truncate sm:block">
                    <span className="font-kanit text-sm text-[#4CA771]">{m.email}</span>
                  </div>

                  {/* Score */}
                  <div className="col-span-8 sm:col-span-2 sm:text-center">
                    <span className="inline-flex items-baseline gap-1 font-kanit text-sm">
                      <span className="font-semibold text-[#14532D]">{m.score}</span>
                      <span className="text-[#14532D]/40">/</span>
                      <span className="text-[#14532D]/60">{m.maxScore}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <div
                      className="col-span-4 flex justify-end gap-1 sm:col-span-1 sm:justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
<button
                        type="button"
                        onClick={() => setConfirmTarget(m)}
                        disabled={isDeleting}
                        className="rounded-xl p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                        aria-label="ลบ"
                        title="ลบสมาชิกออกจากคอร์ส"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Expanded exam scores ── */}
                {isExpanded && m.examScores.length > 0 && (
                  <div className="border-t border-black/5 bg-[#F0FDF4]/60 px-5 py-3">
                    <div className="space-y-2">
                      {m.examScores.map((es) => (
                        <div
                          key={es.examId}
                          className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-2.5"
                        >
                          <span className="font-kanit text-sm text-[#14532D]/80">
                            {es.examTitle}
                          </span>
                          <span className="inline-flex items-baseline gap-1 font-kanit text-sm">
                            <span className="font-semibold text-[#14532D]">{es.score}</span>
                            <span className="text-[#14532D]/40">/</span>
                            <span className="text-[#14532D]/60">{es.maxScore}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isExpanded && m.examScores.length === 0 && (
                  <div className="border-t border-black/5 bg-[#F0FDF4]/60 px-5 py-3">
                    <p className="font-kanit text-sm text-[#14532D]/50">ไม่มีข้อสอบในคอร์สนี้</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[#14532D] disabled:opacity-40"
            aria-label="ก่อนหน้า"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pagination.map((p, idx) => {
            if (p === "...") {
              return (
                <div
                  key={`dots-${idx}`}
                  className="inline-flex h-9 w-9 items-center justify-center font-kanit text-sm text-[#14532D]/50"
                >
                  …
                </div>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl font-kanit text-sm font-medium transition",
                  isActive
                    ? "bg-[#14532D] text-white shadow"
                    : "border border-black/10 bg-white text-[#14532D] hover:bg-[#F0FDF4]",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[#14532D] disabled:opacity-40"
            aria-label="ถัดไป"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* ── CSV Export Modal ── */}
      {csvModalOpen && createPortal(
        <div className="fixed inset-0 z-[100]">
          <button
            aria-label="Close modal"
            className="absolute inset-0 bg-black/40"
            onClick={() => setCsvModalOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl font-[Kanit]">
              <h3 className="text-lg font-semibold text-[#14532D]">
                เลือกข้อสอบที่ต้องการส่งออก
              </h3>
              <p className="mt-1 text-sm text-[#14532D]/60">
                เลือกข้อสอบที่จะรวมใน CSV (ผ่าน ≥ 80% ของคะแนนรวมที่เลือก)
              </p>

              <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
                {allExams.length === 0 ? (
                  <p className="text-sm text-[#14532D]/50">ไม่มีข้อสอบในคอร์สนี้</p>
                ) : (
                  <>
                    {/* Select all / Deselect all */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F0FDF4] px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedExams.size === allExams.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExams(new Set(allExams.map((ex) => ex.examId)));
                          } else {
                            setSelectedExams(new Set());
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 accent-emerald-600"
                      />
                      <span className="text-sm font-medium text-[#14532D]">
                        เลือกทั้งหมด
                      </span>
                    </label>

                    {allExams.map((exam) => (
                      <label
                        key={exam.examId}
                        className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-2.5 border border-black/5 hover:bg-[#F0FDF4]/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedExams.has(exam.examId)}
                          onChange={(e) => {
                            setSelectedExams((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) {
                                next.add(exam.examId);
                              } else {
                                next.delete(exam.examId);
                              }
                              return next;
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 accent-emerald-600"
                        />
                        <span className="flex-1 text-sm text-[#14532D]/80">
                          {exam.examTitle}
                        </span>
                        <span className="text-xs text-[#14532D]/50">
                          {exam.maxScore} คะแนน
                        </span>
                      </label>
                    ))}
                  </>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={onExportCsv}
                  disabled={selectedExams.size === 0}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    ดาวน์โหลด CSV
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <ConfirmModal
        open={confirmTarget !== null}
        title="ลบสมาชิก"
        description={`ต้องการลบสมาชิก "${confirmTarget?.name}" ออกจากคอร์สนี้?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (confirmTarget) doDelete(confirmTarget);
          setConfirmTarget(null);
        }}
        onClose={() => setConfirmTarget(null)}
      />
    </section>
  );
}
