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
    <div className="relative min-h-screen bg-[#F4FCEB] text-[#14532D]">
      {/* soft background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#14532D]/10 blur-3xl" />
        <div className="absolute -right-28 top-24 h-[520px] w-[520px] rounded-full bg-[#4CA771]/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/35 blur-3xl" />
      </div>

      {/* sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
          {/* Left */}
          <div className="min-w-0">
            <Link
              href={`/courses/${courseId}/exams/`}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm text-[#14532D] shadow-sm ring-1 ring-black/10 transition hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">ออกจากข้อสอบ</span>
            </Link>
          </div>

          {/* Center */}
          <div className="hidden sm:block text-sm font-medium text-[#14532D]">
            ทำข้อสอบ
          </div>

          {/* Right: spacer */}
          <div />
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 pb-16">
        {/* "Form sheet" */}
        <section className="mx-auto max-w-4xl overflow-hidden rounded-[10px] bg-white/80 shadow-[0_0_10px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          {/* top accent bar */}
          <div className="h-2 w-full bg-[#14532D]" />

          <div className="p-2 sm:p-4">{children}</div>

          <div className="border-t border-black/5 px-5 py-4 text-xs text-[#14532D]/60 sm:px-7">
            กรุณาตรวจสอบคำตอบก่อนกด "ส่งคำตอบ"
          </div>
        </section>
      </main>
    </div>
  );
}