import Link from "next/link";
import { siteConfig } from "@/lib/site";

type LogoProps = {
  href?: string;
};

export function Logo({ href = "/" }: LogoProps) {
  return (
    <Link href={href} className="flex items-center gap-3 text-slate-50 no-underline">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#c9ff60,#67d58a)] font-extrabold text-[#08100b] shadow-[0_14px_30px_rgba(103,213,138,.18)]">
        S
      </div>
      <div className="font-[family-name:var(--font-cormorant)] text-[1.55rem] font-semibold tracking-[-0.03em]">
        {siteConfig.name}
        <span className="text-[var(--accent)]">.</span>
      </div>
    </Link>
  );
}
