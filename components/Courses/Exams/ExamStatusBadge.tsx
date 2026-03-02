import * as React from "react";

export type ExamStatus = "HIDE" | "SHOW";

const styles: Record<ExamStatus, string> = {
  HIDE: "bg-slate-100 text-slate-700 border-slate-200",
  SHOW: "bg-green-50 text-green-700 border-green-200"
};

const labels: Record<ExamStatus, string> = {
  HIDE: "ร่าง",
  SHOW: "เผยแพร่"
};

export default function ExamStatusBadge({ status }: { status: ExamStatus }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
        styles[status],
      ].join(" ")}
    >
      {labels[status]}
    </span>
  );
}
