"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessCodeGate({
  courseId,
  examId,
  examTitle,
}: {
  courseId: string;
  examId: string;
  examTitle: string;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError("รหัสเข้าสอบต้องเป็นตัวเลข 6 หลัก");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/exams/${examId}/verify-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessCode: trimmed }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "รหัสเข้าสอบไม่ถูกต้อง");
        return;
      }

      // Code verified, reload page (server will now see the verified cookie/state)
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_0_6px_#CAE0BC]">
        <div className="text-center">
          <div className="text-lg font-medium text-[#14532D]">{examTitle}</div>
          <div className="mt-2 text-sm text-[#14532D]/70">
            กรุณากรอกรหัสเข้าสอบ 6 หลัก
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="h-12 w-full rounded-xl border border-black/10 text-center text-2xl tracking-[0.3em] outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
            autoFocus
          />

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="h-11 w-full rounded-xl bg-[#14532D] text-sm font-medium text-white transition hover:bg-[#14532D]/90 disabled:opacity-50"
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสอบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
