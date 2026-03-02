import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  href: string;
  Icon: LucideIcon;
};

export default function ExamTypeCard({ title, description, href, Icon }: Props) {
  return (
    <Link
      href={href}
      className="group relative w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_0_4px_0_#CAE0BC] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(20,83,45,0.12)]"
    >
      <div className="flex items-center gap-5 p-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100">
          <Icon className="h-7 w-7 text-green-800" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-kanit text-2xl font-medium text-green-900">
            {title}
          </div>
          {description ? (
            <div className="mt-1 font-kanit text-sm text-green-900/70">
              {description}
            </div>
          ) : null}
        </div>

        <ChevronRight className="h-6 w-6 text-green-900/40 transition group-hover:translate-x-0.5 group-hover:text-green-900/70" />
      </div>
    </Link>
  );
}
