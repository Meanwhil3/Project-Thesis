import Link from "next/link";
import { TreePine } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(117deg,_#E9FFEE_0%,_#FFFBE3_100%)] px-4">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
          <TreePine className="h-12 w-12 text-emerald-600" />
        </div>

        {/* 404 number */}
        <p className="text-[100px] font-bold leading-none tracking-tighter text-emerald-200 select-none sm:text-[140px]">
          404
        </p>

        {/* Message */}
        <h1 className="mt-2 text-2xl font-semibold text-[#14532D] sm:text-3xl">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#6E8E59]">
          หน้าที่คุณกำลังค้นหาอาจถูกลบ เปลี่ยนชื่อ
          หรือไม่มีอยู่ในระบบแล้ว
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            กลับหน้าหลัก
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-emerald-200 bg-white px-6 py-2.5 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            เข้าสู่ระบบ
          </Link>
        </div>

        {/* Brand */}
        <p className="mt-10 text-xs text-[#6E8E59]/60">
          © {new Date().getFullYear()} WoodCertify
        </p>
      </div>
    </div>
  );
}
