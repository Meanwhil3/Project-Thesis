"use client";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-emerald-100 bg-white">
      {/* Tree shadow (responsive) */}
      <div className="pointer-events-none absolute bottom-0 right-0">
        <Image
          src="/TreeShadow.png"
          alt="Tree silhouette background"
          width={420}
          height={240}
          priority
          className="
            w-[140px]
            sm:w-[200px]
            md:w-[260px]
            lg:w-[320px]
            xl:w-[380px]
            h-auto
            object-contain
            object-bottom
            opacity-20
          "
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#14532D]">
              Contact
            </h3>
            <ul className="mt-3 space-y-1 text-sm leading-6 text-[#6E8E59]">
              <li>0888888888</li>
              <li>
                <a
                  href="mailto:hellosawadee@gmail.com"
                  className="underline-offset-2 hover:underline"
                >
                  hellosawadee@gmail.com
                </a>
              </li>
              <li>
                ที่อยู่ : 61 ถ. พหลโยธิน แขวงลาดพร้าว เขตจตุจักร
                <br />
                กรุงเทพมหานคร 10900
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#14532D]">
              About Us
            </h3>
            <ul className="mt-3 space-y-1 text-sm leading-6 text-[#6E8E59]">
              <li>ทำแบบทดสอบพันธุ์ไม้</li>
              <li>ดูข้อมูลพันธุ์ไม้ทั้งหมด</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-[#6E8E59]">
          <span>© {new Date().getFullYear()} WoodCertify</span>
        </div>
      </div>
    </footer>
  );
}
