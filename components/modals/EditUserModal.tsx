"use client";

import { useEffect, useState } from "react";
import { Role, UserItem } from "@/components/UserManagement";

type EditUserModalProps = {
  open: boolean;
  user: UserItem | null;
  onClose: () => void;
  onSave: (updatedUser: UserItem) => void;
};

export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("trainee");

  // preload ข้อมูล user เมื่อเปิด modal
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
  }, [user]);

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />

      {/* modal */}
      <div className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-xl font-[Kanit]">
        <h3 className="text-lg font-semibold text-[#14532D]">
          แก้ไขข้อมูลผู้ใช้งาน
        </h3>

        {/* name */}
        <div className="mt-4">
          <label className="text-sm text-[#3A532D]">ชื่อ – นามสกุล</label>
          <input
            className="mt-1 h-10 w-full rounded-md border border-[#CDE3BD] px-3 text-sm focus:border-[#4CA771] focus:outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* email */}
        <div className="mt-4">
          <label className="text-sm text-[#3A532D]">อีเมล</label>
          <input
            type="email"
            className="mt-1 h-10 w-full rounded-md border border-[#CDE3BD] px-3 text-sm focus:border-[#4CA771] focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* role */}
        <div className="mt-4">
          <label className="text-sm text-[#3A532D]">บทบาท</label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-[#CDE3BD] px-3 text-sm focus:border-[#4CA771] focus:outline-none"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="admin">ผู้ดูแล (Admin)</option>
            <option value="examiner">ผู้สอบ</option>
            <option value="trainee">ผู้อบรม</option>
          </select>
        </div>

        {/* actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={() =>
              onSave({
                ...user,
                fullName,
                email,
                role,
              })
            }
            className="rounded-lg bg-[#4CA771] px-4 py-2 text-sm text-white hover:bg-[#3b8f5f]"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
