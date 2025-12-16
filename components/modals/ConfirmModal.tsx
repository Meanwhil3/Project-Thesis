"use client";

import * as React from "react";

type ConfirmVariant = "danger" | "warning" | "default";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;

  onConfirm: () => void;
  onClose: () => void;
};

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  variant = "default",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600"
      : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* dialog */}
      <div className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="font-[Kanit]">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm text-neutral-600">{description}</p>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-xl px-4 py-2 text-sm text-white",
              confirmClass
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
