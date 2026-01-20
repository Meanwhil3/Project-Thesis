"use client";

import { useEffect, useMemo, useState } from "react";
import { Role, Status, UserItem } from "@/components/UserManagement";
import FilterSelect, { SelectOption } from "@/components/ui/FilterSelect";

type EditUserModalProps = {
  open: boolean;
  user: UserItem | null;
  onClose: () => void;
  onSave: (updatedUser: UserItem) => void | Promise<void>;
};

const roleOptions: SelectOption<Role>[] = [
  { value: "admin", label: "ผู้ดูแล (Admin)" },
  { value: "instructor", label: "ผู้สอน" },
  { value: "trainee", label: "ผู้อบรม" },
];

const statusOptions: SelectOption<Status>[] = [
  { value: "active", label: "กำลังใช้งาน" },
  { value: "blocked", label: "ระงับ" },
];

export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("trainee");
  const [status, setStatus] = useState<Status>("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ preload เมื่อ "เปิด" และ user เปลี่ยน
  useEffect(() => {
    if (!open || !user) return;
    setFullName(user.fullName ?? "");
    setEmail(user.email ?? "");
    setRole(user.role);
    setStatus(user.status);
    setSaving(false);
    setError(null);
  }, [open, user]);

  const canSave = useMemo(() => {
    return !!user && fullName.trim().length > 0 && !saving;
  }, [user, fullName, saving]);

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={() => !saving && onClose()}
        aria-label="Close"
      />

      {/* modal */}
      <div className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-xl font-[Kanit]">
        <h3 className="text-lg font-semibold text-[#14532D]">
          แก้ไขข้อมูลผู้ใช้งาน
        </h3>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* name */}
        <div className="mt-4">
          <label className="text-sm text-[#3A532D]">ชื่อ – นามสกุล</label>
          <input
            className="mt-1 h-10 w-full rounded-md border border-[#CDE3BD] px-3 text-sm focus:border-[#4CA771] focus:outline-none disabled:bg-gray-50"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* email (readonly เพราะ API PATCH ไม่รองรับ) */}
        <div className="mt-4">
          <label className="text-sm text-[#3A532D]">อีเมล</label>
          <input
            type="email"
            className="mt-1 h-10 w-full rounded-md border border-[#CDE3BD] px-3 text-sm bg-gray-50 text-gray-600"
            value={email}
            readOnly
          />
          <p className="mt-1 text-xs text-[#6E8E59]">
            * อีเมลไม่สามารถแก้ไขได้ในหน้านี้
          </p>
        </div>

        {/* role */}
        <div className="mt-4">
          <label className="text-sm text-[#3A532D]">บทบาท</label>
          <div className="mt-1">
            <FilterSelect<Role>
              value={role}
              onValueChange={setRole}
              placeholder="เลือกบทบาท"
              options={roleOptions}
              disabled={saving}
            />
          </div>
        </div>

        {/* status */}
        <div className="mt-4">
          <label className="text-sm text-[#3A532D]">สถานะ</label>
          <div className="mt-1">
            <FilterSelect<Status>
              value={status}
              onValueChange={setStatus}
              placeholder="เลือกสถานะ"
              options={statusOptions}
              disabled={saving}
            />
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            disabled={!canSave}
            onClick={async () => {
              setError(null);
              setSaving(true);
              try {
                await Promise.resolve(
                  onSave({
                    ...user,
                    fullName: fullName.trim(),
                    role,
                    status,
                    // email คงเดิม (ไม่ส่งไป API อยู่ดี)
                    email,
                  })
                );
              } catch (e: any) {
                setError(e?.message ?? "บันทึกไม่สำเร็จ");
                setSaving(false);
              }
            }}
            className="rounded-lg bg-[#4CA771] px-4 py-2 text-sm text-white hover:bg-[#3b8f5f] disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
