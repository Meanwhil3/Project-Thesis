// components/Courses/AddAnnouncementModal.tsx
"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createAnnouncement } from "@/app/(course)/courses/[courseId]/action";

export default function AddAnnouncementModal({ courseId }: { courseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#16A34A] px-4 font-kanit text-[14px] font-medium text-white shadow-[0_10px_30px_-18px_rgba(22,163,74,0.65)] transition hover:opacity-95 active:scale-[0.99]"
      >
        <Plus className="h-4 w-4" />
        เพิ่มประกาศ
      </button>

      {isOpen && (
        /* แก้ไขจุดนี้: ใช้ z-[999] เพื่อให้อยู่เหนือทุกอย่างบนหน้าจอ */
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          {/* เนื้อหา Modal */}
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* ปุ่มปิดมุมขวาบน */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition p-2"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <h3 className="font-kanit text-2xl font-semibold text-[#14532D]">สร้างประกาศใหม่</h3>
              <p className="text-[#6E8E59] text-sm mt-1">แจ้งข่าวสารสำคัญให้กับผู้เข้าร่วมอบรม</p>
            </div>

            <form action={handleSubmit} className="space-y-5 font-kanit">
              <div>
                <label className="block text-[14px] font-medium text-[#14532D] mb-2">หัวข้อประกาศ</label>
                <input
                  name="title"
                  required
                  placeholder="เช่น แจ้งกำหนดการสอบครั้งที่ 1"
                  className="w-full rounded-2xl border border-[#CDE3BD] bg-[#F8FFF9] p-4 outline-none focus:ring-2 focus:ring-[#16A34A]/30 transition placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#14532D] mb-2">เนื้อหา</label>
                <textarea
                  name="content"
                  required
                  rows={5}
                  placeholder="รายละเอียดประกาศ..."
                  className="w-full rounded-2xl border border-[#CDE3BD] bg-[#F8FFF9] p-4 outline-none focus:ring-2 focus:ring-[#16A34A]/30 transition resize-none placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-2xl bg-gray-100 py-4 font-medium text-gray-600 hover:bg-gray-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-2xl bg-[#16A34A] py-4 font-medium text-white shadow-lg shadow-[#16A34A]/20 transition hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "กำลังบันทึก..." : "โพสต์ประกาศ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}