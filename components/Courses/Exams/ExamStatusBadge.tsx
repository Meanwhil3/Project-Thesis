import * as React from "react";

export type ExamStatus = "draft" | "published" | "closed";

const styles: Record<ExamStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  published: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-red-50 text-red-700 border-red-200",
};

const labels: Record<ExamStatus, string> = {
  draft: "ร่าง",
  published: "เผยแพร่",
  closed: "ปิด",
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
