"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ElementType } from "react";
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

type CourseStatusUI = "open" | "closed";

type Initial = {
  title: string;
  subtitle: string;
  enrollCode: string;
  imageUrl: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: CourseStatusUI;
};

type FormState = {
  title: string;
  subtitle: string;
  enrollCode: string;
  imageFile: File | null;
  location: string;
  startDate: string;
  endDate: string;
  status: CourseStatusUI;
};

export default function EditCourseForm({
  courseId,
  initial,
  isAdmin = false,
}: {
  courseId: string;
  initial: Initial;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: initial.title,
    subtitle: initial.subtitle,
    enrollCode: initial.enrollCode,
    imageFile: null,
    location: initial.location,
    startDate: initial.startDate,
    endDate: initial.endDate,
    status: initial.status,
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(initial.imageUrl);

  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    title: false,
    subtitle: false,
    enrollCode: false,
    imageFile: false,
    location: false,
    startDate: false,
    endDate: false,
    status: false,
  });

  useEffect(() => {
    if (!form.imageFile) {
      setImagePreviewUrl(initial.imageUrl || "https://placehold.co/760x380");
      return;
    }
    const url = URL.createObjectURL(form.imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.imageFile, initial.imageUrl]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = "กรุณากรอกชื่ออบรม";
    if (!form.subtitle.trim()) e.subtitle = "กรุณากรอกคำอธิบาย";
    if (form.subtitle.trim().length > 180) e.subtitle = "คำอธิบายยาวเกิน 180 ตัวอักษร";

    // ✅ enroll code (ถ้าคุณอยากให้ optional ให้เอา if นี้ออก)
    if (!form.enrollCode.trim()) e.enrollCode = "กรุณากรอกรหัสเข้าคอร์ส";
    if (form.enrollCode.trim().length > 255) e.enrollCode = "รหัสเข้าคอร์สยาวเกินไป (สูงสุด 255)";

    if (!form.location.trim()) e.location = "กรุณากรอกสถานที่";
    if (!form.startDate) e.startDate = "กรุณาเลือกวันที่เริ่ม";
    if (!form.endDate) e.endDate = "กรุณาเลือกวันที่สิ้นสุด";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่ม";
    }
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
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
    setTouched({
      title: true,
      subtitle: true,
      enrollCode: true,
      imageFile: true,
      location: true,
      startDate: true,
      endDate: true,
      status: true,
    });

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

      if (form.imageFile) fd.append("image", form.imageFile);

      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Update course failed");
      }

      // จะกลับไปหน้าไหนเลือกได้:
      router.push(`/courses/${courseId}`);
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
        <div className="mb-7">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[#CDE3BD] bg-white px-3 py-2 text-sm font-medium text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 transition hover:bg-[#F6FBF6]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าคอร์ส
          </Link>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#14532D]">
            แก้ไขคอร์สอบรม
          </h1>
          <p className="text-sm text-[#6E8E59]">อัปเดตข้อมูลคอร์สในระบบ</p>
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
                error={touched.title ? errors.title : undefined}
                onChange={(v) => setField("title", v)}
              />

              <TextAreaField
                label="คำอธิบาย / หัวข้ออบรม"
                icon={CheckCircle2}
                value={form.subtitle}
                rows={3}
                maxLength={180}
                error={touched.subtitle ? errors.subtitle : undefined}
                onChange={(v) => setField("subtitle", v.slice(0, 180))}
                onBlur={() => setTouched((p) => ({ ...p, subtitle: true }))}
              />

              <Field
                label="รหัสเข้าคอร์ส (Enroll code)"
                icon={TextCursorInput}
                value={form.enrollCode}
                placeholder="เช่น WOOD-2026-01"
                error={touched.enrollCode ? errors.enrollCode : undefined}
                onChange={(v) => setField("enrollCode", v)}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-[#14532D]">
                  รูปภาพอบรม (อัปโหลดใหม่ถ้าต้องการเปลี่ยน)
                </label>
                <ImageDropzone
                  file={form.imageFile}
                  onFileChange={(f) => setField("imageFile", f)}
                  error={touched.imageFile ? errors.imageFile : undefined}
                  onBlur={() => setTouched((p) => ({ ...p, imageFile: true }))}
                />
              </div>

              <Field
                label="สถานที่"
                icon={MapPin}
                value={form.location}
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

              <div className="mt-2 flex items-center justify-between">
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

          <div className="rounded-2xl border border-[#CDE3BD] bg-white p-6 shadow-[0_0_4px_0_#CAE0BC]/50">
            <p className="text-sm font-semibold text-[#14532D]">พรีวิวรูป</p>
            <img
              src={imagePreviewUrl}
              alt="course preview"
              className="mt-4 h-[180px] w-full rounded-2xl object-cover ring-1 ring-black/5"
            />
            <div className="mt-3 text-xs text-[#6E8E59]">
              ถ้าไม่อัปโหลดรูปใหม่ ระบบจะใช้รูปเดิม
            </div>
          </div>
        </div>
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

/* ---- shared small components (copy จากของเดิมได้เลย) ---- */

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
    if (!isImage) return alert("ไฟล์ต้องเป็นรูปภาพเท่านั้น (JPG/PNG/WEBP)");
    if (f.size > maxBytes) return alert("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
    onFileChange(f);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onBlur={onBlur}
        onClick={pickFile}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          validateAndSet(e.dataTransfer.files?.[0] ?? null);
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
          <span className="text-sm font-semibold">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์</span>
        </div>

        <div className="text-xs text-[#6E8E59]">
          {file ? (
            <span className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">{file.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
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

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
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
      <label className="mb-2 block text-sm font-medium text-[#14532D]">{label}</label>
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
  icon: ElementType;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#14532D]">{label}</label>
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
      <label className="mb-2 block text-sm font-medium text-[#14532D]">{label}</label>
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
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
