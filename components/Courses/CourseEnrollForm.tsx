"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

type Props = {
  courseId: string;
  courseClosed: boolean;
};

export default function CourseEnrollForm({ courseId, courseClosed }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
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
        setTimeout(() => {
          router.refresh();
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

  if (courseClosed) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <LockKeyhole className="h-7 w-7 text-gray-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">
            ปิดรับสมัครแล้ว
          </div>
          <div className="mt-1 text-xs text-gray-400">
            คอร์สนี้ไม่เปิดรับสมัครในขณะนี้
          </div>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-7 w-7 text-emerald-600"
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
            กำลังเข้าสู่หน้าคอร์ส...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-4 text-sm text-[#6E8E59]">
        กรอกรหัสลงทะเบียนเพื่อเข้าถึงเนื้อหาและข้อสอบในคอร์สนี้
      </p>
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

      <button
        onClick={handleSubmit}
        disabled={state === "loading"}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14532D] text-sm font-medium text-white shadow-sm transition hover:bg-[#166534] active:scale-[0.98] disabled:opacity-60"
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
          "ยืนยันลงทะเบียน"
        )}
      </button>
    </div>
  );
}
