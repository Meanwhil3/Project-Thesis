// components/ui/DateTimePicker.tsx
"use client";

import { forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);

const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

type Props = {
  value: string; // datetime-local format "YYYY-MM-DDTHH:mm"
  onChange: (v: string) => void;
  placeholder?: string;
  minDate?: Date;
  hasError?: boolean;

  /** allow parent to control width, etc. */
  className?: string;
};

/** Convert datetime-local string → Date | null */
function parseLocalString(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/** Convert Date → datetime-local string "YYYY-MM-DDTHH:mm" */
function toLocalString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Custom input that matches the system styling
const CustomInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void; placeholder?: string; hasError?: boolean }
>(({ value, onClick, placeholder, hasError }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    className={`flex h-11 w-full items-center gap-2.5 rounded-xl border bg-white px-4 text-left text-sm outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-300 text-red-600 focus:border-red-400 focus:ring-red-200/50"
        : "border-[#CDE3BD] text-[#14532D] focus:border-[#4CA771] focus:ring-[#4CA771]/25"
    }`}
  >
    <CalendarDays className={`h-4 w-4 shrink-0 ${hasError ? "text-red-400" : "text-[#4CA771]"}`} />
    <span className={value ? "" : "text-[#14532D]/40"}>{value || placeholder || "เลือกวันและเวลา"}</span>
  </button>
));
CustomInput.displayName = "DateTimePickerInput";

export default function DateTimePicker({
  value,
  onChange,
  placeholder,
  minDate,
  hasError,
  className,
}: Props) {
  const selected = parseLocalString(value);

  return (
    <DatePicker
      selected={selected}
      onChange={(date: Date | null) => {
        if (date) onChange(toLocalString(date));
      }}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="เวลา"
      dateFormat="d MMMM yyyy, HH:mm น."
      locale="th"
      minDate={minDate}
      placeholderText={placeholder}
      customInput={<CustomInput hasError={hasError} />}

      // ✅ สำคัญ: บังคับ wrapper ให้เต็ม
      wrapperClassName={`w-full ${className ?? ""}`}
      className="w-full"

      calendarClassName="green-datepicker"
      showPopperArrow={false}
      popperPlacement="bottom-start"
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex items-center justify-between px-3 py-2">
          <button
            type="button"
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#14532D] transition hover:bg-[#E9FFEE] disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="font-kanit text-sm font-medium text-[#14532D]">
            {MONTHS_TH[date.getMonth()]} {date.getFullYear() + 543}
          </span>

          <button
            type="button"
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#14532D] transition hover:bg-[#E9FFEE] disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    />
  );
}