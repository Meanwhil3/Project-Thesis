"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Plus,
  Save,
  TextCursorInput,
} from "lucide-react";

type CourseStatus = "open" | "closed";

type CourseFormState = {
  title: string;
  subtitle: string;
  imageUrl: string;
  location: string;
  locationPlaceId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: CourseStatus;
};

const initialState: CourseFormState = {
  title: "",
  subtitle: "",
  imageUrl: "https://placehold.co/760x380",
  location: "",
  locationPlaceId: "",
  startDate: "",
  endDate: "",
  status: "open",
};

function toThaiDateRange(start: string, end: string) {
  if (!start && !end) return "";
  if (start && !end) return start;
  if (!start && end) return end;
  return `${start} - ${end}`;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState<CourseFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof CourseFormState, boolean>>(
    {
      title: false,
      subtitle: false,
      imageUrl: false,
      location: false,
      locationPlaceId: false,
      startDate: false,
      endDate: false,
      status: false,
    }
  );

  const errors = useMemo(() => {
    const e: Partial<Record<keyof CourseFormState, string>> = {};

    if (!form.title.trim()) e.title = "กรุณากรอกชื่ออบรม";
    if (!form.subtitle.trim()) e.subtitle = "กรุณากรอกคำอธิบาย";
    if (!form.location.trim()) e.location = "กรุณากรอกสถานที่";
    if (!form.startDate) e.startDate = "กรุณาเลือกวันที่เริ่ม";
    if (!form.endDate) e.endDate = "กรุณาเลือกวันที่สิ้นสุด";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่ม";
    }
    if (!form.imageUrl.trim()) e.imageUrl = "กรุณากรอกลิงก์รูปภาพ";

    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function setField<K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // mark touched
    setTouched((prev) => ({
      ...prev,
      title: true,
      subtitle: true,
      imageUrl: true,
      location: true,
      startDate: true,
      endDate: true,
      status: true,
    }));

    if (!isValid) return;

    try {
      setSubmitting(true);

      // TODO: ถ้ามี API แล้วให้เปิดใช้ fetch ส่วนนี้
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Create course failed");

      console.log("CREATE COURSE:", form);

      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-[#CDE3BD] bg-white px-3 py-2 text-sm font-medium text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 transition hover:bg-[#F6FBF6] active:scale-[0.99]"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับไปหน้าอบรม
              </Link>
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#14532D]">
              เพิ่มคอร์สอบรม
            </h1>
            <p className="text-sm text-[#6E8E59]">
              กรอกข้อมูลให้ครบเพื่อสร้างคอร์สใหม่ในระบบ
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#CDE3BD] bg-white px-3 py-1 text-xs text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/60">
            <Plus className="h-4 w-4 text-[#16A34A]" />
            <span>สร้างคอร์สใหม่</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-[#CDE3BD] bg-white p-6 shadow-[0_0_4px_0_#CAE0BC]/50"
          >
            <div className="grid gap-5">
              <Field
                label="ชื่ออบรม"
                icon={TextCursorInput}
                value={form.title}
                placeholder="เช่น อบรมรุ่นที่ 4"
                error={touched.title ? errors.title : undefined}
                onChange={(v) => setField("title", v)}
              />

              <Field
                label="คำอธิบาย / หัวข้ออบรม"
                icon={CheckCircle2}
                value={form.subtitle}
                placeholder="เช่น อบรมพื้นฐานการพิสูจน์ไม้ (ภาคทฤษฎี)"
                error={touched.subtitle ? errors.subtitle : undefined}
                onChange={(v) => setField("subtitle", v)}
              />

              <Field
                label="ลิงก์รูปภาพ"
                icon={ImageIcon}
                value={form.imageUrl}
                placeholder="https://..."
                error={touched.imageUrl ? errors.imageUrl : undefined}
                onChange={(v) => setField("imageUrl", v)}
              />

              <Field
                label="สถานที่"
                icon={MapPin}
                value={form.location}
                placeholder="เช่น ห้องประชุม A / M 02"
                error={touched.location ? errors.location : undefined}
                onChange={(v) => setField("location", v)}
              />
              

              <div className="grid gap-4 sm:grid-cols-2">
                <DateField
                  label="วันที่เริ่ม"
                  icon={CalendarDays}
                  value={form.startDate}
                  error={touched.startDate ? errors.startDate : undefined}
                  onChange={(v) => setField("startDate", v)}
                  onBlur={() => setTouched((p) => ({ ...p, startDate: true }))}
                />
                <DateField
                  label="วันที่สิ้นสุด"
                  icon={CalendarDays}
                  value={form.endDate}
                  error={touched.endDate ? errors.endDate : undefined}
                  onChange={(v) => setField("endDate", v)}
                  onBlur={() => setTouched((p) => ({ ...p, endDate: true }))}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#14532D]">
                  สถานะการรับสมัคร
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatusChip
                    active={form.status === "open"}
                    onClick={() => setField("status", "open")}
                    title="เปิดรับสมัคร"
                    desc="ผู้ใช้สามารถลงทะเบียนได้"
                  />
                  <StatusChip
                    active={form.status === "closed"}
                    onClick={() => setField("status", "closed")}
                    title="ปิดรับสมัคร"
                    desc="ไม่เปิดรับเพิ่ม"
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/courses"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#CDE3BD] bg-white px-5 text-sm font-medium text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 transition hover:bg-[#F6FBF6]"
                >
                  ยกเลิก
                </Link>

                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#14532D] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition hover:bg-[#0F3F22] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? "กำลังบันทึก..." : "บันทึกคอร์ส"}
                </button>
              </div>
            </div>
          </form>

          {/* Preview */}
          <div className="rounded-2xl border border-[#CDE3BD] bg-white p-6 shadow-[0_0_4px_0_#CAE0BC]/50">
            <p className="text-sm font-semibold text-[#14532D]">พรีวิวการ์ด</p>
            <p className="mt-1 text-xs text-[#6E8E59]">
              ตัวอย่างหน้าตาโดยประมาณ (ยังไม่รวมจำนวนผู้ลงทะเบียน)
            </p>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#E6F1DF] bg-white">
              <div className="relative">
                <img
                  src={form.imageUrl || "https://placehold.co/760x380"}
                  alt={form.title || "course preview"}
                  className="h-[180px] w-full object-cover"
                />
                <div className="absolute left-4 top-4">
                  <span
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur",
                      form.status === "open"
                        ? "border-[#86EFAC] bg-[#DCFCE7]/80 text-[#14532D]"
                        : "border-[#E5E7EB] bg-white/80 text-[#6B7280]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        form.status === "open" ? "bg-[#16A34A]" : "bg-[#9CA3AF]",
                      ].join(" ")}
                    />
                    {form.status === "open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 pt-4 font-kanit">
                <h3 className="text-[18px] font-semibold leading-[28px] text-[#14532D]">
                  {form.title.trim() || "ชื่ออบรม"}
                </h3>
                <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-[18px] text-[#6E8E59]">
                  {form.subtitle.trim() || "คำอธิบายอบรม"}
                </p>

                <div className="mt-4 space-y-2 text-[13px] font-medium leading-[20px] text-[#111827]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#16A34A]" />
                    <span>{toThaiDateRange(form.startDate, form.endDate) || "ช่วงวันที่อบรม"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#16A34A]" />
                    <span>{form.location.trim() || "สถานที่อบรม"}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#6E8E59]">
              * หลังคุณผูก API/DB แล้ว ค่อยให้พรีวิวแสดงข้อมูลจริง + อัปโหลดรูปได้
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  placeholder,
  error,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#14532D]">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "h-11 w-full rounded-xl border bg-white pl-9 pr-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-[#CDE3BD] focus:border-[#4CA771] focus:ring-[#4CA771]/25",
          ].join(" ")}
        />
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function DateField({
  label,
  icon: Icon,
  value,
  error,
  onChange,
  onBlur,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#14532D]">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={[
            "h-11 w-full rounded-xl border bg-white pl-9 pr-4 text-sm text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-[#CDE3BD] focus:border-[#4CA771] focus:ring-[#4CA771]/25",
          ].join(" ")}
        />
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function StatusChip({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border px-4 py-3 text-left shadow-[0_0_4px_0_#CAE0BC]/40 transition",
        active
          ? "border-[#86EFAC] bg-[#DCFCE7]/70"
          : "border-[#CDE3BD] bg-white hover:bg-[#F6FBF6]",
      ].join(" ")}
    >
      <p
        className={[
          "text-sm font-semibold",
          active ? "text-[#14532D]" : "text-[#14532D]",
        ].join(" ")}
      >
        {title}
      </p>
      <p className="mt-1 text-xs text-[#6E8E59]">{desc}</p>
    </button>
  );
}
