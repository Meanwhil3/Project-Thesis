"use client";

// components/Courses/EnrollButton.tsx
// วางปุ่มนี้บนหน้า course detail — แสดงเฉพาะ TRAINEE ที่ยังไม่ได้ enroll
// Props:
//   courseId   — id ของคอร์ส
//   courseName — ชื่อคอร์ส (แสดงใน modal)
//   enrolled   — true ถ้า user enroll แล้ว (ส่งมาจาก server component)

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  courseId: string;
  courseName: string;
  enrolled: boolean;
};

export default function EnrollButton({ courseId, courseName, enrolled }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [state, setState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // focus input เมื่อ modal เปิด
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setCode("");
      setState("idle");
      setErrorMsg("");
    }
  }, [open]);

  // ปิด modal เมื่อกด Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleSubmit() {
    if (!code.trim()) {
      setErrorMsg("กรุณากรอกรหัสลงทะเบียน");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enroll_code: code.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setState("success");
        // รีเฟรชหน้าหลังจาก 1.2 วิ เพื่อให้ server component โหลดสถานะใหม่
        setTimeout(() => {
          router.refresh();
          setOpen(false);
        }, 1200);
      } else {
        setErrorMsg(data?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setState("error");
      }
    } catch {
      setErrorMsg("เครือข่ายมีปัญหา กรุณาลองใหม่");
      setState("error");
    }
  }

  // ─── ถ้า enroll แล้ว แสดง badge ─────────────────────────────────────────
  if (enrolled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14532D]/10 px-3 py-1.5 text-sm font-medium text-[#14532D]">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
        ลงทะเบียนแล้ว
      </span>
    );
  }

  return (
    <>
      {/* ─── Trigger button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#14532D] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#166534] active:scale-[0.98]"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        ลงทะเบียนเข้าคอร์ส
      </button>

      {/* ─── Modal backdrop ──────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* ─── Modal card ─────────────────────────────────────────────────── */}
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
            {/* Header */}
            <div className="border-b border-black/5 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[#14532D]">
                    ลงทะเบียนเข้าคอร์ส
                  </div>
                  <div className="mt-0.5 text-sm text-[#14532D]/60 line-clamp-1">
                    {courseName}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-0.5 rounded-lg p-1 text-[#14532D]/40 hover:bg-black/5 hover:text-[#14532D]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {state === "success" ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                      className="h-6 w-6 text-emerald-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#14532D]">
                      ลงทะเบียนสำเร็จ!
                    </div>
                    <div className="mt-1 text-xs text-[#14532D]/60">
                      กำลังอัปเดตหน้า...
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-[#14532D]">
                    รหัสลงทะเบียน
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (state === "error") setState("idle");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                    placeholder="กรอกรหัส..."
                    maxLength={100}
                    className={`mt-2 h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2 ${
                      state === "error"
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-black/15 focus:border-[#4CA771] focus:ring-[#4CA771]/20"
                    }`}
                  />
                  {state === "error" && errorMsg && (
                    <p className="mt-1.5 text-xs text-red-600">{errorMsg}</p>
                  )}
                  <p className="mt-2 text-xs text-[#14532D]/50">
                    ขอรหัสได้จากผู้สอนหรือผู้ดูแลระบบ
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            {state !== "success" && (
              <div className="flex justify-end gap-2 border-t border-black/5 px-6 py-4">
                <button
                  onClick={() => setOpen(false)}
                  disabled={state === "loading"}
                  className="rounded-xl border border-black/10 px-4 py-2 text-sm text-[#14532D] hover:bg-black/5 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={state === "loading"}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534] disabled:opacity-60"
                >
                  {state === "loading" ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      กำลังลงทะเบียน...
                    </>
                  ) : (
                    "ยืนยัน"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}