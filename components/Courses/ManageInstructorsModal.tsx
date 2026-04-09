// components/Courses/ManageInstructorsModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Pencil, X, Users, Search, UserPlus, Trash2 } from "lucide-react";
import {
  getInstructorCandidates,
  addInstructor,
  removeInstructor,
} from "@/app/(course)/courses/[courseId]/action";

type CurrentInstructor = {
  id: string;
  userId: string;
  name: string;
  email: string;
};

type Props = {
  courseId: string;
  currentInstructors: CurrentInstructor[];
};

export default function ManageInstructorsModal({
  courseId,
  currentInstructors,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [candidates, setCandidates] = useState<
    { userId: string; name: string; email: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearch("");
      setRemoveConfirm(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInstructorCandidates();
      setCandidates(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
    }
  }, [isOpen, loadCandidates]);

  const currentUserIds = new Set(currentInstructors.map((i) => i.userId));

  const availableCandidates = candidates.filter(
    (c) =>
      !currentUserIds.has(c.userId) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleAdd(userId: string) {
    setPendingAction(userId);
    try {
      await addInstructor(courseId, userId);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเพิ่มผู้สอน");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRemove(userId: string) {
    setPendingAction(userId);
    try {
      await removeInstructor(courseId, userId);
      setRemoveConfirm(null);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบผู้สอน");
    } finally {
      setPendingAction(null);
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
            <Users className="h-5 w-5 text-[#14532D]" />
          </div>
          <div className="flex-1">
            <h3 className="font-kanit text-lg font-semibold text-[#14532D]">
              จัดการผู้สอน
            </h3>
            <p className="font-kanit text-xs text-[#6E8E59]">
              เพิ่มหรือลบผู้สอนในคอร์สนี้
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-7 py-6 font-kanit">
          {/* ผู้สอนปัจจุบัน */}
          <div className="mb-6">
            <h4 className="mb-3 text-[14px] font-medium text-[#14532D]">
              ผู้สอนปัจจุบัน ({currentInstructors.length})
            </h4>
            {currentInstructors.length ? (
              <div className="space-y-2">
                {currentInstructors.map((ins) => (
                  <div
                    key={ins.id}
                    className="flex items-center gap-3 rounded-2xl border border-[#CDE3BD] bg-[#F8FFF9] p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[14px] font-semibold text-[#14532D]">
                      {ins.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium text-[#14532D]">
                        {ins.name}
                      </div>
                      <div className="truncate text-[12px] text-[#6E8E59]">
                        {ins.email}
                      </div>
                    </div>

                    {removeConfirm === ins.userId ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setRemoveConfirm(null)}
                          className="rounded-lg px-2 py-1 text-[12px] text-gray-500 hover:bg-gray-100"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={() => handleRemove(ins.userId)}
                          disabled={pendingAction === ins.userId}
                          className="rounded-lg bg-red-600 px-2 py-1 text-[12px] text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {pendingAction === ins.userId ? "..." : "ยืนยัน"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRemoveConfirm(ins.userId)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-red-400 transition hover:bg-red-50 hover:text-red-600"
                        title="ลบผู้สอน"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#CDE3BD] bg-white p-4 text-center text-[13px] text-[#6E8E59]">
                ยังไม่มีผู้สอนในคอร์สนี้
              </div>
            )}
          </div>

          {/* เพิ่มผู้สอน */}
          <div>
            <h4 className="mb-3 text-[14px] font-medium text-[#14532D]">
              เพิ่มผู้สอน
            </h4>

            {/* ช่องค้นหา */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรืออีเมล..."
                className="w-full rounded-2xl border border-[#CDE3BD] bg-[#F8FFF9] py-3 pl-10 pr-4 text-[14px] outline-none transition placeholder:text-gray-400 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
              />
            </div>

            {loading ? (
              <div className="py-6 text-center text-[13px] text-[#6E8E59]">
                กำลังโหลด...
              </div>
            ) : availableCandidates.length ? (
              <div className="max-h-[200px] space-y-2 overflow-y-auto">
                {availableCandidates.map((c) => (
                  <div
                    key={c.userId}
                    className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 transition hover:border-[#CDE3BD] hover:bg-[#F8FFF9]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[14px] font-semibold text-gray-600">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium text-[#14532D]">
                        {c.name}
                      </div>
                      <div className="truncate text-[12px] text-[#6E8E59]">
                        {c.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(c.userId)}
                      disabled={pendingAction === c.userId}
                      className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-[#16A34A] px-3 text-[12px] font-medium text-white transition hover:bg-[#15803d] disabled:opacity-50"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      เพิ่ม
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#CDE3BD] bg-white p-4 text-center text-[13px] text-[#6E8E59]">
                {search
                  ? "ไม่พบผู้สอนที่ตรงกับคำค้นหา"
                  : "ไม่มีผู้สอนที่สามารถเพิ่มได้"}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] px-7 py-4">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 font-kanit text-[14px] font-medium text-gray-600 transition hover:bg-gray-50"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 active:scale-[0.98]"
        aria-label="จัดการผู้สอน"
      >
        <Pencil className="h-5 w-5 text-[#111827]" />
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  );
}
