"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Mail, User, Shield, CalendarDays, Lock, Pencil } from "lucide-react";

type ProfileData = {
  first_name: string;
  last_name: string;
  email: string;
  role: string | null;
  created_at: string | null;
};

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // edit name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [savingName, setSavingName] = useState(false);

  // change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/auth/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.email) setProfile(data);
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [status, router]);

  if (status === "loading" || loadingProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showNav />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const roleLabel = profile.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase()
    : "-";

  const createdDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase();

  const startEditingName = () => {
    setEditFirstName(profile.first_name);
    setEditLastName(profile.last_name);
    setNameError("");
    setNameSuccess("");
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setNameError("");
  };

  const handleSaveName = async () => {
    setNameError("");
    setNameSuccess("");

    if (!editFirstName.trim() || !editLastName.trim()) {
      setNameError("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    setSavingName(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setNameError(data.message || "เกิดข้อผิดพลาด");
        return;
      }

      setProfile(data);
      setIsEditingName(false);
      setNameSuccess("บันทึกข้อมูลสำเร็จ");
      await updateSession();
    } catch {
      setNameError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "เกิดข้อผิดพลาด");
        return;
      }

      setSuccess("เปลี่ยนรหัสผ่านสำเร็จ");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        showNav
        user={{
          name: session?.user?.name,
          image: session?.user?.image,
          role: (session?.user as any)?.role,
        }}
      />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#6E8E59] transition hover:text-[#14532D]"
          >
            <ArrowLeft size={16} />
            ย้อนกลับ
          </button>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Profile card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-2xl font-bold text-emerald-800 ring-4 ring-emerald-100">
                    {initials}
                  </div>
                  <h1 className="mt-4 text-lg font-semibold text-[#14532D]">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <span className="mt-2 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {roleLabel}
                  </span>
                  <p className="mt-3 text-xs text-gray-400">
                    สมาชิกตั้งแต่ {createdDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Details + Change password */}
            <div className="space-y-6 lg:col-span-2">
              {/* Info card */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#14532D]">
                    ข้อมูลส่วนตัว
                  </h2>
                  {!isEditingName && (
                    <button
                      type="button"
                      onClick={startEditingName}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <Pencil size={13} />
                      แก้ไข
                    </button>
                  )}
                </div>

                {nameSuccess && (
                  <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {nameSuccess}
                  </div>
                )}

                {isEditingName ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                          ชื่อ
                        </label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          placeholder="กรอกชื่อ"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                          นามสกุล
                        </label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          placeholder="กรอกนามสกุล"
                        />
                      </div>
                    </div>

                    {nameError && (
                      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {nameError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={cancelEditingName}
                        disabled={savingName}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
                      >
                        {savingName ? "กำลังบันทึก..." : "บันทึก"}
                      </button>
                    </div>

                    {/* Non-editable fields shown below */}
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4">
                        <Mail size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-400">อีเมล</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">
                            {profile.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4">
                        <Shield size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-400">สิทธิ์การใช้งาน</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">
                            {roleLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4 sm:col-span-2">
                        <CalendarDays size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-400">วันที่สมัคร</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">
                            {createdDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4">
                      <User size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-400">ชื่อ</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {profile.first_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4">
                      <User size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-400">นามสกุล</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {profile.last_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4">
                      <Mail size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-400">อีเมล</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4">
                      <Shield size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-400">สิทธิ์การใช้งาน</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {roleLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-4 sm:col-span-2">
                      <CalendarDays size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-400">วันที่สมัคร</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {createdDate}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Change password card */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Lock size={18} className="text-emerald-600" />
                  <h2 className="text-base font-semibold text-[#14532D]">
                    ความปลอดภัย
                  </h2>
                </div>

                {success && (
                  <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                {!showPasswordForm ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50/50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">รหัสผ่าน</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        แนะนำให้เปลี่ยนรหัสผ่านเป็นประจำเพื่อความปลอดภัย
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(true);
                        setError("");
                        setSuccess("");
                      }}
                      className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                      เปลี่ยนรหัสผ่าน
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        รหัสผ่านปัจจุบัน
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder="กรอกรหัสผ่านปัจจุบัน"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        รหัสผ่านใหม่
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        ยืนยันรหัสผ่านใหม่
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setError("");
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
                      >
                        {submitting ? "กำลังดำเนินการ..." : "บันทึก"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
