// app/admin/courses/[courseId]/edit/EditCourseClient.tsx
"use client";

import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type ElementType,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Save,
  TextCursorInput,
  Trash2,
  UploadCloud,
} from "lucide-react";

import ConfirmModal from "@/components/modals/ConfirmModal";

type CourseStatus = "open" | "closed";

type CourseFormState = {
  title: string;
  subtitle: string;
  enrollCode: string;
  imageFile: File | null;
  location: string;
  startDate: string;
  endDate: string;
  status: CourseStatus;
};

export default function EditCourseClient({
  courseId,
  initial,
  isAdmin = false,
}: {
  courseId: string;
  initial: Omit<CourseFormState, "imageFile"> & { imageUrl: string };
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState<CourseFormState>({
    title: initial.title,
    subtitle: initial.subtitle,
    enrollCode: initial.enrollCode,
    imageFile: null,
    location: initial.location,
    startDate: initial.startDate,
    endDate: initial.endDate,
    status: initial.status,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(
    initial.imageUrl,
  );

  // preview รูปใหม่ (ถ้าเลือก)
  useEffect(() => {
    if (!form.imageFile) {
      setImagePreviewUrl(initial.imageUrl);
      return;
    }
    const url = URL.createObjectURL(form.imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.imageFile, initial.imageUrl]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof CourseFormState, string>> = {};

    if (!form.title.trim()) e.title = "กรุณากรอกชื่ออบรม";
    if (!form.subtitle.trim()) e.subtitle = "กรุณากรอกคำอธิบาย";
    if (form.subtitle.trim().length > 180)
      e.subtitle = "คำอธิบายยาวเกิน 180 ตัวอักษร";
    if (!form.location.trim()) e.location = "กรุณากรอกสถานที่";
    if (!form.startDate) e.startDate = "กรุณาเลือกวันที่เริ่ม";
    if (!form.endDate) e.endDate = "กรุณาเลือกวันที่สิ้นสุด";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่ม";
    }

    // ✅ edit ไม่บังคับอัปโหลดรูป (ถ้าไม่เปลี่ยนรูปก็ใช้เดิม)
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function setField<K extends keyof CourseFormState>(
    key: K,
    value: CourseFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function doDelete() {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "ลบคอร์สไม่สำเร็จ");
      }
      router.push("/admin/courses");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "ลบคอร์สไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setDeleting(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("subtitle", form.subtitle.trim().slice(0, 180));
      fd.append("enrollCode", form.enrollCode.trim());
      fd.append("location", form.location.trim());
      fd.append("startDate", form.startDate);
      fd.append("endDate", form.endDate);
      fd.append("status", form.status === "open" ? "SHOW" : "HIDE");

      // ✅ ส่งรูปเฉพาะตอนเลือกไฟล์ใหม่
      if (form.imageFile) fd.append("image", form.imageFile);

      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());

      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("แก้ไขไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-[#CDE3BD] bg-white px-3 py-2 text-sm font-medium text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 transition hover:bg-[#F6FBF6]"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับไปหน้าอบรม
            </Link>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#14532D]">
              แก้ไขคอร์สอบรม
            </h1>
            <p className="text-sm text-[#6E8E59]">
              แก้ไขข้อมูลคอร์ส แล้วกดบันทึก
            </p>
          </div>
        </div>

        {/* ✅ เอา UI เดิมของ new/page.tsx มาใส่ต่อได้เลย */}
        {/* จุดสำคัญคือใช้ form state เดิม + onSubmit นี้ */}
        {/* ถ้าต้องการ ผมจะช่วย “ย้ายทั้งไฟล์ new” มาเป็น component เดียวใช้ร่วมกันได้ */}
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
              error={errors.title}
              onChange={(v) => setField("title", v)}
            />

            <TextAreaField
              label="คำอธิบาย / หัวข้ออบรม"
              icon={CheckCircle2}
              value={form.subtitle}
              placeholder="เช่น อบรมพื้นฐานการพิสูจน์ไม้ (ภาคทฤษฎี)"
              rows={3}
              maxLength={180}
              onChange={(v) => setField("subtitle", v.slice(0, 180))}
              error={errors.subtitle}
            />

            <Field
              label="Enroll code (รหัสเข้าคอร์ส)"
              icon={TextCursorInput}
              value={form.enrollCode}
              placeholder="เช่น WOOD-2026-001"
              onChange={(v) => setField("enrollCode", v)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[#14532D]">
                รูปภาพอบรม (ถ้าต้องการเปลี่ยน)
              </label>
              <ImageDropzone
                file={form.imageFile}
                onFileChange={(f) => setField("imageFile", f)}
              />
              <div className="mt-3 overflow-hidden rounded-2xl border border-[#E6F1DF]">
                <img
                  src={imagePreviewUrl}
                  alt="preview"
                  className="h-[180px] w-full object-cover"
                />
              </div>
            </div>

            <Field
              label="สถานที่"
              icon={MapPin}
              value={form.location}
              placeholder="เช่น อาคาร A ชั้น 2 ห้องประชุม 201"
              error={errors.location}
              onChange={(v) => setField("location", v)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                label="วันที่เริ่ม"
                icon={CalendarDays}
                value={form.startDate}
                error={errors.startDate}
                onChange={(v) => setField("startDate", v)}
              />
              <DateField
                label="วันที่สิ้นสุด"
                icon={CalendarDays}
                value={form.endDate}
                error={errors.endDate}
                onChange={(v) => setField("endDate", v)}
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

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={!isValid || submitting || deleting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#14532D] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition hover:bg-[#0F3F22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting || submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "กำลังลบ..." : "ลบคอร์ส"}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>

      <ConfirmModal
        open={showDeleteConfirm}
        title="ลบคอร์ส"
        description="คุณต้องการลบคอร์สนี้หรือไม่? การลบจะไม่สามารถย้อนกลับได้"
        confirmText="ลบคอร์ส"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          doDelete();
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

/* ---------- components: Field / DateField / TextAreaField / ImageDropzone ---------- */
/* (เอาของเดิมจากหน้า new/page.tsx มาใช้ได้ตรงๆ) */

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
}: {
  label: string;
  icon: ElementType;
  value: string;
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
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
}: {
  label: string;
  icon: ElementType;
  value: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  error?: string;
  onChange: (v: string) => void;
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

function ImageDropzone({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function validateAndSet(f: File | null) {
    if (!f) return onFileChange(null);
    const isImage = f.type.startsWith("image/");
    const maxBytes = 5 * 1024 * 1024;
    if (!isImage) return alert("ไฟล์ต้องเป็นรูปภาพเท่านั้น (JPG/PNG/WEBP)");
    if (f.size > maxBytes) return alert("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
    onFileChange(f);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      className="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-[#CDE3BD] bg-white px-4 py-6 text-center shadow-[0_0_4px_0_#CAE0BC]/50 hover:bg-[#F6FBF6]"
    >
      <div className="flex items-center gap-2 text-[#14532D]">
        <UploadCloud className="h-5 w-5 text-[#16A34A]" />
        <span className="text-sm font-semibold">คลิกเพื่อเลือกไฟล์</span>
      </div>

      <div className="text-xs text-[#6E8E59]">
        {file ? (
          <span className="inline-flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="font-medium">{file.name}</span>
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
