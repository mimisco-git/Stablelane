import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

type LogoProps = {
  href?: string;
  compact?: boolean;
};

export function Logo({ href = "/", compact = false }: LogoProps) {
  return (
    <Link href={href} className="group flex items-center gap-3 text-slate-50 no-underline">
      <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,21,.88),rgba(10,18,13,.82))] shadow-[0_18px_40px_rgba(0,0,0,.26)]">
        <Image
          src="/brand/stablelane-mark.svg"
          alt="Stablelane mark"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col leading-none">
        <div className="font-[family-name:var(--font-cormorant)] text-[1.58rem] font-semibold tracking-[-0.03em]">
          {siteConfig.name}
          <span className="text-[var(--accent)]">.</span>
        </div>
        {!compact ? (
          <div className="mt-1 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Stablecoin revenue OS
          </div>
        ) : null}
      </div>
    </Link>
  );
}
