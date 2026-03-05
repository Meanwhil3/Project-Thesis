// components/Courses/AnnouncementCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Megaphone } from "lucide-react";

type Props = {
  title: string;
  message: string;
  meta: string;
  children?: React.ReactNode; // สำหรับ EditAnnouncementModal
};

export default function AnnouncementCard({
  title,
  message,
  meta,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ตรวจสอบว่าข้อความถูกตัดหรือไม่
  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [message]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const detail = isOpen ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-7 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
            <Megaphone className="h-5 w-5 text-[#14532D]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-kanit text-lg font-semibold text-[#14532D] truncate">
              {title}
            </h3>
            <p className="font-kanit text-xs text-[#6E8E59]">{meta}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-7 py-6">
          <div className="font-kanit text-[14px] leading-6 text-[#2D5C3F] whitespace-pre-wrap">
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] px-7 py-4">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 font-kanit text-[14px] font-medium text-gray-600 transition hover:bg-gray-50"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(20,83,45,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-22px_rgba(20,83,45,0.45)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-28 w-28 rounded-full bg-[#DCFCE7]/50 blur-2xl" />

      {/* ปุ่มแก้ไข (EditAnnouncementModal) */}
      {children}

      <div
        className="font-kanit relative z-10 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="text-[14px] font-medium text-[#14532D]">{title}</div>
        <div
          ref={textRef}
          className="mt-2 text-[12px] leading-5 text-[#2D5C3F] whitespace-pre-wrap line-clamp-2"
        >
          {message}
        </div>
        {isClamped && (
          <span className="mt-1 inline-block text-[12px] font-medium text-[#16A34A] hover:underline">
            อ่านเพิ่มเติม
          </span>
        )}
        <div className="mt-3 text-[10px] text-[#6E8E59]">{meta}</div>
      </div>

      {mounted && createPortal(detail, document.body)}
    </article>
  );
}
