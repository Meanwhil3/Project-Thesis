"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TabItem = {
  key: string;
  label: string;
  href?: string;
  disabled?: boolean;
};

type NavbarProps = {
  items: TabItem[];
  activeKey?: string;
  matchRoute?: boolean;
  onChange?: (key: string) => void;

  threshold?: number;
  topOffsetClassName?: string;

  /** ✅ ถ้า scroll ไม่ได้เกิดที่ window ให้ส่ง ref ของ scroll container */
  scrollRef?: React.RefObject<HTMLElement | null>;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar({
  items,
  activeKey,
  matchRoute = true,
  onChange,
  threshold = 12,
  topOffsetClassName = "top-0",
  scrollRef,
}: NavbarProps) {
  const pathname = usePathname();

  const derivedActiveKey = React.useMemo(() => {
    if (activeKey) return activeKey;
    if (!matchRoute) return items[0]?.key ?? "";
    const found = items.find((it) => it.href && pathname?.startsWith(it.href));
    return found?.key ?? items[0]?.key ?? "";
  }, [activeKey, matchRoute, items, pathname]);

  const [isVisible, setIsVisible] = React.useState(true);
  const lastYRef = React.useRef(0);
  const tickingRef = React.useRef(false);

  React.useEffect(() => {
    const el = scrollRef?.current ?? null;
    const getY = () => (el ? el.scrollTop : window.scrollY || 0);

    lastYRef.current = getY();

    const onScroll = () => {
      const y = getY();
      if (tickingRef.current) return;

      tickingRef.current = true;
      requestAnimationFrame(() => {
        const delta = y - lastYRef.current;

        if (y <= 0) {
          setIsVisible(true);
        } else if (Math.abs(delta) >= threshold) {
          // ✅ เลื่อนลงซ่อน, เลื่อนขึ้นแสดง
          setIsVisible(delta < 0);
          lastYRef.current = y;
        }

        tickingRef.current = false;
      });
    };

    const target: any = el ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [threshold, scrollRef]);

  const idx = Math.max(0, items.findIndex((i) => i.key === derivedActiveKey));
  const cols = Math.max(1, items.length);

  return (
    <div
      className={cn(
        "sticky z-50 w-full transition-transform duration-300 will-change-transform",
        topOffsetClassName,
        isVisible ? "translate-y-0" : "-translate-y-[120%]"
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="relative h-[41px] w-full overflow-hidden rounded-[10px] bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.25)]">
          <div
            className="absolute top-0 h-full rounded-[10px] bg-[#D6EBDD] transition-all duration-300"
            style={{
              width: `${100 / cols}%`,
              left: `${(idx * 100) / cols}%`,
            }}
          />

          <div
            className="relative grid h-full w-full"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {items.map((item) => {
              const isActive = item.key === derivedActiveKey;

              const base =
                "h-full w-full select-none px-2 text-center text-[16px] flex items-center justify-center transition-colors duration-200";
              const text = item.disabled
                ? "text-[#BDBDBD]"
                : isActive
                ? "text-[#1C803D]"
                : "text-[#878787] hover:text-[#2f2f2f]";

              const common = {
                className: cn(base, text),
                "aria-current": isActive ? ("page" as const) : undefined,
              };

              if (item.href && !item.disabled) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    {...common}
                    onClick={() => onChange?.(item.key)}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  {...common}
                  disabled={item.disabled}
                  onClick={() => !item.disabled && onChange?.(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
