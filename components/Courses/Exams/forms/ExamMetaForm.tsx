// components/Courses/Exams/forms/ExamMetaForm.tsx
"use client";

import { useMemo } from "react";
import FilterSelect from "@/components/ui/FilterSelect";
import { RefreshCw, CalendarClock, ArrowRight, Clock } from "lucide-react";
import DateTimePicker from "@/components/ui/DateTimePicker";

export type ExamStatus = "HIDE" | "SHOW";

const statusOptions = [
  { value: "HIDE", label: "ซ่อน (ร่าง)" },
  { value: "SHOW", label: "แสดง (เผยแพร่)" },
] as const;

function formatDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0 || isNaN(ms)) return null;
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} นาที`;
  if (m === 0) return `${h} ชั่วโมง`;
  return `${h} ชั่วโมง ${m} นาที`;
}

export default function ExamMetaForm(props: {
  title: string;
  setTitle: (v: string) => void;

  accessCode?: string;
  setAccessCode?: (v: string) => void;
  onRegenerateCode?: () => void;

  description: string;
  setDescription: (v: string) => void;

  startDateTime: string;
  setStartDateTime: (v: string) => void;

  endDateTime: string;
  setEndDateTime: (v: string) => void;

  status: ExamStatus;
  setStatus: (v: ExamStatus) => void;
}) {
  const {
    title,
    setTitle,
    accessCode,
    setAccessCode,
    onRegenerateCode,
    description,
    setDescription,
    startDateTime,
    setStartDateTime,
    endDateTime,
    setEndDateTime,
    status,
    setStatus,
  } = props;

  const duration = useMemo(
    () => formatDuration(startDateTime, endDateTime),
    [startDateTime, endDateTime],
  );

  const isInvalid =
    startDateTime &&
    endDateTime &&
    new Date(endDateTime) <= new Date(startDateTime);

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {/* ชื่อการสอบ */}
      <div className="md:col-span-2">
        <div className="font-kanit text-sm text-[#166534]">ชื่อการสอบ *</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
          placeholder="ชื่อการสอบ"
        />
      </div>

      {/* รหัสเข้าสอบ */}
      {typeof accessCode === "string" && setAccessCode ? (
        <div>
          <div className="font-kanit text-sm text-[#166534]">รหัสเข้าสอบ *</div>
          <div className="mt-2 flex gap-2">
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
              placeholder="000000"
            />
            {onRegenerateCode ? (
              <button
                type="button"
                onClick={onRegenerateCode}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-3"
                title="สุ่มรหัส"
              >
                <RefreshCw className="h-4 w-4 text-[#14532D]" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div />
      )}

      {/* รายละเอียด */}
      <div className="md:col-span-3">
        <div className="font-kanit text-sm text-[#166534]">
          รายละเอียดการสอบ
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 min-h-[90px] w-full rounded-2xl border border-black/10 p-4 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25"
          placeholder="รายละเอียด (ไม่บังคับ)"
        />
      </div>

      {/* กำหนดเวลาสอบ + สถานะ */}
      <div className="md:col-span-3">
        <div className="flex items-center gap-2 font-kanit text-sm text-[#166534]">
          <CalendarClock className="h-4 w-4" />
          กำหนดเวลาสอบ *
        </div>

        <div className="mt-2 rounded-2xl border border-[#CDE3BD] bg-[#F4FBF1]/50 p-4">
          <div className="grid items-stretch gap-4 md:grid-cols-[2fr_1fr]">
            {/* เวลาเริ่ม-สิ้นสุด (2/3) */}
            <div className="grid min-w-0 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
              <div className="min-w-0">
                <div className="mb-1.5 font-kanit text-xs text-[#14532D]/60">
                  เริ่มสอบ
                </div>
                <div className="min-w-0">
                  <DateTimePicker
                    value={startDateTime}
                    onChange={setStartDateTime}
                    placeholder="เลือกวันและเวลาเริ่มสอบ"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="hidden items-center justify-center pt-5 md:flex">
                <ArrowRight className="h-5 w-5 text-[#4CA771]" />
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 font-kanit text-xs text-[#14532D]/60">
                  สิ้นสุดสอบ
                </div>
                <div className="min-w-0">
                  <DateTimePicker
                    value={endDateTime}
                    onChange={setEndDateTime}
                    placeholder="เลือกวันและเวลาสิ้นสุด"
                    minDate={
                      startDateTime ? new Date(startDateTime) : undefined
                    }
                    hasError={!!isInvalid}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* สถานะ (1/3) */}
            <div className="md:border-l md:border-[#CDE3BD] md:pl-4">
              <div className="mb-1.5 font-kanit text-xs text-[#14532D]/60">
                สถานะ
              </div>
              <FilterSelect<ExamStatus>
                value={status}
                onValueChange={setStatus}
                placeholder="เลือกสถานะ"
                options={statusOptions}
              />
            </div>
          </div>
        </div>

        {/* ระยะเวลา / ข้อผิดพลาด */}
        {isInvalid ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
            <Clock className="h-3.5 w-3.5" />
            เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มสอบ
          </div>
        ) : duration ? (
          <div className="mt-3 flex items-center gap-1.5 font-kanit text-xs text-[#14532D]/60">
            <Clock className="h-3.5 w-3.5" />
            ระยะเวลาสอบ:{" "}
            <span className="font-medium text-[#14532D]">{duration}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
