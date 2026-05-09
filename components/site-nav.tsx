"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const navRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={navRef} className="sticky top-4 z-50 mx-auto w-[min(calc(100%-32px),1280px)]">
      {/* ── Main nav bar ── */}
      <nav className={`flex items-center justify-between gap-4 rounded-[20px] border px-5 py-3 transition-all duration-300 ${
        scrolled
          ? "border-white/12 bg-[rgba(5,10,7,0.96)] shadow-[0_12px_60px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[32px]"
          : "border-white/8 bg-[rgba(6,12,9,0.82)] shadow-[0_8px_40px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl"
      }`}>

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/12 bg-[linear-gradient(135deg,rgba(201,255,96,0.15),rgba(103,213,138,0.08))] shadow-[0_4px_16px_rgba(0,0,0,.4)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 14L9 4L14 14" stroke="#c9ff60" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 11h7" stroke="#c9ff60" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <span className="font-[family-name:var(--font-cormorant)] text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--text)]">
            Stablelane<span className="text-[var(--accent)]">.</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((item) => (
            <li key={item.href} className="list-none">
              <Link
                href={isHome ? item.href : `/${item.href}`}
                className="rounded-[10px] px-4 py-2 text-[0.83rem] font-medium tracking-[0.005em] text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--text)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Testnet badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-3 py-1.5 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted-2)]">Testnet</span>
          </div>

          {signedIn ? (
            <>
              <div className="hidden items-center gap-2 rounded-[12px] border border-white/8 bg-white/3 px-3.5 py-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
                <span className="text-[0.8rem] font-medium text-[var(--muted)]">{email.split("@")[0]}</span>
              </div>
              <Link href="/app"
                className="rounded-[12px] bg-[var(--accent)] px-5 py-2 text-[0.83rem] font-bold tracking-[0.01em] text-[#06100a] shadow-[0_0_24px_rgba(201,255,96,0.18)] transition hover:-translate-y-px hover:shadow-[0_0_36px_rgba(201,255,96,0.28)]">
                Open workspace
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth"
                className="hidden rounded-[12px] px-4 py-2 text-[0.83rem] font-medium text-[var(--muted)] transition hover:text-[var(--text)] sm:block">
                Sign in
              </Link>
              <Link href="/auth"
                className="rounded-[12px] bg-[var(--accent)] px-5 py-2 text-[0.83rem] font-bold tracking-[0.01em] text-[#06100a] shadow-[0_0_24px_rgba(201,255,96,0.18)] transition hover:-translate-y-px hover:shadow-[0_0_36px_rgba(201,255,96,0.28)]">
                Start free
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button type="button" onClick={() => setOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/8 bg-white/3 text-[var(--muted)] transition hover:text-[var(--text)] lg:hidden"
            aria-label="Toggle menu">
            {open ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="mt-2 overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(5,10,7,0.97)] p-3 shadow-[0_24px_80px_rgba(0,0,0,.6)] backdrop-blur-2xl lg:hidden">
          <div className="grid gap-1 mb-3">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="rounded-[12px] px-4 py-3 text-[0.88rem] font-medium text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--text)]">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/6 pt-3 grid gap-2">
            {signedIn ? (
              <Link href="/app" onClick={() => setOpen(false)}
                className="rounded-[14px] bg-[var(--accent)] px-4 py-3 text-center text-[0.88rem] font-bold text-[#06100a]">
                Open workspace
              </Link>
            ) : (
              <>
                <Link href="/auth" onClick={() => setOpen(false)}
                  className="rounded-[14px] border border-white/10 px-4 py-3 text-center text-[0.88rem] font-medium text-[var(--muted)]">
                  Sign in
                </Link>
                <Link href="/auth" onClick={() => setOpen(false)}
                  className="rounded-[14px] bg-[var(--accent)] px-4 py-3 text-center text-[0.88rem] font-bold text-[#06100a]">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
