"use client";
import Image from "next/image";
import { Phone, Mail, MapPin, TreePine } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-12 w-screen left-1/2 -translate-x-1/2 border-t border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40">
      {/* Tree shadow (responsive) */}
      <div className="pointer-events-none absolute bottom-0 right-0">
        <Image
          src="/TreeShadow.png"
          alt="Tree silhouette background"
          width={420}
          height={240}
          priority
          className="w-[140px] sm:w-[200px] md:w-[260px] lg:w-[320px] xl:w-[380px] h-auto object-contain object-bottom opacity-20"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Logo & branding */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14532D] text-white">
                <TreePine size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#14532D]">
                  WoodCertify
                </h3>
                <p className="text-[11px] text-[#6E8E59]">กรมป่าไม้</p>
              </div>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#6E8E59]/80">
              ระบบฐานข้อมูลและทดสอบพรรณไม้ออนไลน์
              <br />
              โดยกรมป่าไม้ กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม
            </p>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#14532D] uppercase">
              ติดต่อเรา
            </h3>
            <div className="mt-1 mb-3" />
            <ul className="space-y-3 text-sm text-[#6E8E59]">
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-emerald-500" />
                <span>025614292-3</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-emerald-500" />
                <a
                  href="mailto:saraban@forest.go.th"
                  className="underline-offset-2 transition-colors hover:text-[#14532D] hover:underline"
                >
                  saraban@forest.go.th
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>
                  61 ถ. พหลโยธิน แขวงลาดพร้าว
                  <br />
                  เขตจตุจักร กรุงเทพฯ 10900
                </span>
              </li>
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#14532D] uppercase">
              ช่องทางอื่นๆ
            </h3>
            <div className="mt-1 mb-3" />
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/royalforestdepartment/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14532D]/10 text-[#14532D] transition-all hover:bg-[#14532D] hover:text-white hover:scale-110"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/pr.royalforestdepartment/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14532D]/10 text-[#14532D] transition-all hover:bg-[#14532D] hover:text-white hover:scale-110"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UCxS8IQZapLeUZCuZcCkhpsg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14532D]/10 text-[#14532D] transition-all hover:bg-[#14532D] hover:text-white hover:scale-110"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6E8E59]/70">
          <span>&copy; {new Date().getFullYear()} WoodCertify. All rights reserved.</span>
          <span>Collaboratively built by IT KMITL &amp; Royal Forest Department</span>
        </div>
      </div>
    </footer>
  );
}
