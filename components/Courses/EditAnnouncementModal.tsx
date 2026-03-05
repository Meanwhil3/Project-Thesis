// components/Courses/EditAnnouncementModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Pencil, X, Megaphone, Trash2 } from "lucide-react";
import {
  updateAnnouncement,
  deleteAnnouncement,
} from "@/app/(course)/courses/[courseId]/action";

type Props = {
  courseId: string;
  announcementId: string;
  initialTitle: string;
  initialContent: string;
};

export default function EditAnnouncementModal({
  courseId,
  announcementId,
  initialTitle,
  initialContent,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setShowDeleteConfirm(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await updateAnnouncement(courseId, announcementId, formData);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการแก้ไขประกาศ");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteAnnouncement(courseId, announcementId);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบประกาศ");
    } finally {
      setIsDeleting(false);
    }
  }

  const modal = isOpen ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-7 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF9C3] ring-1 ring-black/5">
            <Megaphone className="h-5 w-5 text-[#854D0E]" />
          </div>
          <div className="flex-1">
            <h3 className="font-kanit text-lg font-semibold text-[#14532D]">
              แก้ไขประกาศ
            </h3>
            <p className="font-kanit text-xs text-[#6E8E59]">
              แก้ไขหัวข้อหรือเนื้อหาประกาศ
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form action={handleSubmit} className="space-y-5 px-7 py-6 font-kanit">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#14532D]">
              หัวข้อประกาศ
            </label>
            <input
              name="title"
              required
              defaultValue={initialTitle}
              placeholder="เช่น แจ้งกำหนดการสอบครั้งที่ 1"
              className="w-full rounded-2xl border border-[#CDE3BD] bg-[#F8FFF9] px-4 py-3 text-[14px] outline-none transition placeholder:text-gray-400 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#14532D]">
              เนื้อหา
            </label>
            <textarea
              name="content"
              required
              rows={5}
              defaultValue={initialContent}
              placeholder="รายละเอียดประกาศ..."
              className="w-full resize-none rounded-2xl border border-[#CDE3BD] bg-[#F8FFF9] px-4 py-3 text-[14px] outline-none transition placeholder:text-gray-400 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
            />
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-[13px] font-medium text-red-700">
                ยืนยันการลบประกาศนี้?
              </p>
              <p className="mt-1 text-[12px] text-red-500">
                การลบจะไม่สามารถย้อนกลับได้
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-200 text-red-500 transition hover:bg-red-50"
              title="ลบประกาศ"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white py-3 text-[14px] font-medium text-gray-600 transition hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-2xl bg-[#16A34A] py-3 text-[14px] font-medium text-white shadow-lg shadow-[#16A34A]/20 transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 active:scale-[0.98]"
        aria-label="แก้ไขประกาศ"
      >
        <Pencil className="h-5 w-5 text-[#111827]" />
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  );
}
