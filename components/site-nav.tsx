import Link from "next/link";
import { Logo } from "@/components/logo";
import { navLinks } from "@/lib/site";

export function SiteNav() {
  return (
    <nav className="sticky top-4 z-40 mx-auto flex w-[min(calc(100%-36px),1280px)] items-center justify-between gap-5 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
      <Logo />
      <ul className="hidden items-center gap-7 lg:flex">
        {navLinks.map((item) => (
          <li key={item.href} className="list-none">
            <Link href={item.href} className="text-[0.92rem] text-[var(--muted)] transition hover:text-[var(--text)]">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="#waitlist"
        className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
      >
        Join waitlist
      </Link>
    </nav>
  );
}
