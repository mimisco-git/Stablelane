"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { navLinks } from "@/lib/site";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSignedIn(true);
        setEmail(data.session.user.email || "");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
      setEmail(session?.user?.email || "");
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <>
      <nav className="sticky top-4 z-40 mx-auto flex w-[min(calc(100%-36px),1280px)] items-center justify-between gap-5 rounded-full border border-white/10 bg-[rgba(6,12,9,0.88)] px-5 py-3.5 shadow-[0_8px_40px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <Logo compact />

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((item) => (
            <li key={item.href} className="list-none">
              <Link href={isHome ? item.href : `/${item.href}`} className="text-[0.84rem] font-medium tracking-[0.01em] text-[var(--muted)] transition hover:text-[var(--text)]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/3 text-[var(--text)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? "×" : "☰"}
          </button>

          {signedIn ? (
            <>
              <span className="hidden rounded-full border border-white/10 bg-white/3 px-4 py-2.5 text-[0.82rem] font-medium text-[var(--muted)] sm:inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                {email.split("@")[0]}
              </span>
              <Link
                href="/app"
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[0.84rem] font-bold tracking-[0.01em] text-[#06100a] shadow-[0_0_20px_rgba(201,255,96,0.2)] transition hover:-translate-y-px hover:shadow-[0_0_30px_rgba(201,255,96,0.3)]"
              >
                Open workspace
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden rounded-full border border-white/10 bg-transparent px-5 py-2.5 text-[0.84rem] font-semibold tracking-[0.01em] text-[var(--muted)] transition hover:text-[var(--text)] hover:border-white/20 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[0.84rem] font-bold tracking-[0.01em] text-[#06100a] shadow-[0_0_20px_rgba(201,255,96,0.2)] transition hover:-translate-y-px hover:shadow-[0_0_30px_rgba(201,255,96,0.3)]"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-3 w-[min(calc(100%-36px),1280px)] rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.92),rgba(10,18,13,.88))] p-4 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl lg:hidden">
          <div className="grid gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3 text-[0.92rem] font-semibold text-[var(--text)]"
              >
                {item.label}
              </Link>
            ))}
            {signedIn ? (
              <Link
                href="/app"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-[0.92rem] font-bold text-[#08100b]"
              >
                Open workspace
              </Link>
            ) : (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3 text-[0.92rem] font-semibold text-[var(--text)] sm:hidden"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
