// app/admin/courses/new/page.tsx
"use client";

import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type ElementType,
  type FormEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Plus,
  Save,
  TextCursorInput,
  UploadCloud,
} from "lucide-react";

type CourseStatus = "open" | "closed";

type CourseFormState = {
  title: string;
  subtitle: string;
  enrollCode: string;
  imageFile: File | null;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: CourseStatus;
};

const initialState: CourseFormState = {
  title: "",
  subtitle: "",
  enrollCode: "",
  imageFile: null,
  location: "",
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

function buildGoogleMapsSearchUrl(query: string) {
  const q = query.trim();
  if (!q) return "https://www.google.com/maps";
  const params = new URLSearchParams({ api: "1", query: q });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export default function NewCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<CourseFormState>(initialState);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(
    "https://placehold.co/760x380",
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/login"); return; }
    const role = String((session.user as any)?.role ?? "").toUpperCase();
    if (role === "TRAINEE") router.replace("/");
  }, [session, status, router]);

  const [touched, setTouched] = useState<
    Record<keyof CourseFormState, boolean>
  >({
    title: false,
    subtitle: false,
    enrollCode: false,
    imageFile: false,
    location: false,
    startDate: false,
    endDate: false,
    status: false,
  });

  // Create/revoke object URL for preview
  useEffect(() => {
    if (!form.imageFile) {
      setImagePreviewUrl("https://placehold.co/760x380");
      return;
    }
    const url = URL.createObjectURL(form.imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.imageFile]);

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
    if (!form.imageFile) e.imageFile = "กรุณาอัปโหลดรูปภาพ";

    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function setField<K extends keyof CourseFormState>(
    key: K,
    value: CourseFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setTouched((prev) => ({
      ...prev,
      title: true,
      subtitle: true,
      enrollCode: true,
      imageFile: true,
      location: true,
      startDate: true,
      endDate: true,
      status: true,
    }));

    if (!isValid) return;

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("subtitle", form.subtitle.trim());
      const code = form.enrollCode.trim();
      if (code) fd.append("enrollCode", code);
      fd.append("location", form.location.trim());
      fd.append("startDate", form.startDate);
      fd.append("endDate", form.endDate);
      fd.append("status", form.status === "open" ? "SHOW" : "HIDE");

      if (form.imageFile) {
        fd.append("image", form.imageFile);
      }


      const res = await fetch("/api/admin/courses", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Create course failed");
      }

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
          {/* Form */}
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
                label="รหัสเข้าคอร์ส (Enroll Code)"
                icon={TextCursorInput}
                value={form.enrollCode}
                placeholder="เช่น WOOD-2026-A"
                error={touched.enrollCode ? errors.enrollCode : undefined}
                onChange={(v) => setField("enrollCode", v)}
              />

              <TextAreaField
                label="คำอธิบาย / หัวข้ออบรม"
                icon={CheckCircle2}
                value={form.subtitle}
                placeholder="เช่น อบรมพื้นฐานการพิสูจน์ไม้ (ภาคทฤษฎี)"
                rows={2}
                maxLength={180}
                onChange={(v) => setField("subtitle", v.slice(0, 180))}
                error={touched.subtitle ? errors.subtitle : undefined}
                onBlur={() => setTouched((p) => ({ ...p, subtitle: true }))}
              />

              {/* ✅ Drag & Drop Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#14532D]">
                  รูปภาพอบรม
                </label>
                <ImageDropzone
                  file={form.imageFile}
                  onFileChange={(f) => setField("imageFile", f)}
                  error={touched.imageFile ? errors.imageFile : undefined}
                  onBlur={() => setTouched((p) => ({ ...p, imageFile: true }))}
                />
              </div>

              {/* สถานที่ */}
              <Field
                label="สถานที่"
                icon={MapPin}
                value={form.location}
                placeholder="เช่น อาคาร A ชั้น 2 ห้องประชุม 201 (กรม/หน่วยงาน...)"
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
                  src={imagePreviewUrl}
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
                        form.status === "open"
                          ? "bg-[#16A34A]"
                          : "bg-[#9CA3AF]",
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
                    <span>
                      {toThaiDateRange(form.startDate, form.endDate) ||
                        "ช่วงวันที่อบรม"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#16A34A]" />
                    <span className="min-w-0 flex-1 truncate">
                      {form.location.trim() || "สถานที่อบรม"}
                    </span>

                    {form.location.trim() && (
                      <a
                        href={buildGoogleMapsSearchUrl(form.location)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#CDE3BD] bg-white px-3 py-1 text-xs font-semibold text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/40 transition hover:bg-[#F6FBF6]"
                      >
                        เปิดในแผนที่
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-[#6E8E59]">
              รองรับไฟล์: JPG/PNG/WEBP • แนะนำไม่เกิน 5MB
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ImageDropzone({
  file,
  onFileChange,
  error,
  onBlur,
}: {
  file: File | null;
  onFileChange: (f: File | null) => void;
  error?: string;
  onBlur?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function pickFile() {
    inputRef.current?.click();
  }

  function validateAndSet(f: File | null) {
    if (!f) return onFileChange(null);

    const isImage = f.type.startsWith("image/");
    const maxBytes = 5 * 1024 * 1024;
    if (!isImage) {
      alert("ไฟล์ต้องเป็นรูปภาพเท่านั้น (JPG/PNG/WEBP)");
      return;
    }
    if (f.size > maxBytes) {
      alert("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }
    onFileChange(f);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onBlur={onBlur}
        onClick={pickFile}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") pickFile();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0] ?? null;
          validateAndSet(f);
        }}
        className={[
          "group relative flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-6 text-center shadow-[0_0_4px_0_#CAE0BC]/50 outline-none transition",
          error
            ? "border-red-300"
            : dragOver
              ? "border-[#4CA771] ring-2 ring-[#4CA771]/25"
              : "border-[#CDE3BD] hover:bg-[#F6FBF6]",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 text-[#14532D]">
          <UploadCloud className="h-5 w-5 text-[#16A34A]" />
          <span className="text-sm font-semibold">
            ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
          </span>
        </div>

        <div className="text-xs text-[#6E8E59]">
          {file ? (
            <span className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="rounded-lg border border-[#CDE3BD] bg-white px-2 py-1 text-[11px] font-semibold text-[#14532D] hover:bg-[#F6FBF6]"
              >
                เอาออก
              </button>
            </span>
          ) : (
            "รองรับ JPG/PNG/WEBP (ไม่เกิน 5MB)"
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
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
  icon: ElementType;
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
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
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
  icon: ElementType;
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
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

function TextAreaField({
  label,
  icon: Icon,
  value,
  placeholder,
  rows = 3,
  maxLength,
  error,
  onChange,
  onBlur,
}: {
  label: string;
  icon: ElementType;
  value: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
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
        <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#86A97A]" />
        <textarea
          value={value}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={[
            "w-full rounded-xl border bg-white pl-9 pr-4 py-2 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 resize-none",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-[#CDE3BD] focus:border-[#4CA771] focus:ring-[#4CA771]/25",
          ].join(" ")}
        />
      </div>
      {maxLength && (
        <p className="mt-1 text-xs text-[#6E8E59]">
          {value.length}/{maxLength}
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
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
      <p className="text-sm font-semibold text-[#14532D]">{title}</p>
      <p className="mt-1 text-xs text-[#6E8E59]">{desc}</p>
    </button>
  );
}
