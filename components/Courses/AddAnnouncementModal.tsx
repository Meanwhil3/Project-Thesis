// components/Courses/AddAnnouncementModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Megaphone } from "lucide-react";
import { createAnnouncement } from "@/app/(course)/courses/[courseId]/action";

export default function AddAnnouncementModal({ courseId }: { courseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ล็อค scroll เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createAnnouncement(courseId, formData);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสร้างประกาศ");
    } finally {
      setIsPending(false);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
            <Megaphone className="h-5 w-5 text-[#14532D]" />
          </div>
          <div className="flex-1">
            <h3 className="font-kanit text-lg font-semibold text-[#14532D]">
              สร้างประกาศใหม่
            </h3>
            <p className="font-kanit text-xs text-[#6E8E59]">
              แจ้งข่าวสารสำคัญให้กับผู้เข้าร่วมอบรม
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
              placeholder="รายละเอียดประกาศ..."
              className="w-full resize-none rounded-2xl border border-[#CDE3BD] bg-[#F8FFF9] px-4 py-3 text-[14px] outline-none transition placeholder:text-gray-400 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
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
              {isPending ? "กำลังบันทึก..." : "โพสต์ประกาศ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#16A34A] px-4 font-kanit text-[14px] font-medium text-white shadow-[0_10px_30px_-18px_rgba(22,163,74,0.65)] transition hover:opacity-95 active:scale-[0.99]"
      >
        <Plus className="h-4 w-4" />
        เพิ่มประกาศ
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  );
}