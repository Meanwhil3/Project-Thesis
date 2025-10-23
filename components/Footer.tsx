"use client";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-emerald-100 bg-white">
      <div className="pointer-events-none absolute right-[-30] bottom-[-60] h-20 sm:h-48 md:h-56 lg:h-84 w-auto overflow-hidden flex justify-end">
        <Image
          src="/TreeShadow.png"
          alt="Tree silhouette background"
          width={600}
          height={300}
          priority
          className="object-cover object-bottom opacity-20"
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
