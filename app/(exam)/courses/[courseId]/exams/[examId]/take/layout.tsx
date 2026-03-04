import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TakeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string; examId: string };
}) {
  const { courseId } = params;

  return (
    <div className="relative min-h-screen  text-[#14532D]">
      {/* soft background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
      </div>

      {/* ✅ fixed top bar (responsive) */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-4">
          {/* Mobile: flex, Desktop: grid */}
          <div className="flex items-center justify-between gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
            {/* Left */}
            <div className="min-w-0">
              <Link
                href={`/courses/${courseId}/exams/`}
                className="
                  inline-flex items-center gap-2
                  rounded-full bg-white/80
                  px-2.5 py-2 sm:px-3
                  text-sm text-[#14532D]
                  shadow-sm ring-1 ring-black/10
                  transition hover:bg-white
                "
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="sr-only sm:not-sr-only">ออกจากข้อสอบ</span>
              </Link>
            </div>

            {/* Center (only sm+) */}
            <div className="hidden text-sm font-medium text-[#14532D] sm:block sm:text-center">
              ทำข้อสอบ
            </div>

            {/* Right: timer slot */}
            <div className="min-w-0 flex items-center justify-end">
              {/* ✅ prevent overflow; timer can truncate instead of pushing layout */}
              <div
                id="exam-timer-slot"
                className="flex max-w-[52vw] items-center justify-end sm:max-w-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ✅ spacer equals header height */}
      <div aria-hidden className="h-12 sm:h-14" />

      <main className="relative mx-auto max-w-5xl px-3 py-6 pb-16 sm:px-4 sm:py-8">
        <section className="mx-auto max-w-4xl overflow-hidden rounded-[12px] bg-white/80 shadow-[0_0_10px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          <div className="h-2 w-full bg-[#14532D]" />

          <div className="p-2 sm:p-4">{children}</div>

          <div className="border-t border-black/5 px-4 py-3 text-xs text-[#14532D]/60 sm:px-7 sm:py-4">
            กรุณาตรวจสอบคำตอบก่อนกด "ส่งคำตอบ"
          </div>
        </section>
      </main>
    </div>
  );
}