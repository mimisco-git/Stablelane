"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { GlobalSearch } from "@/components/global-search";

function getUnreadCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const notifs = JSON.parse(localStorage.getItem("stablelane_notifications") || "[]");
    return notifs.filter((n: { read: boolean }) => !n.read).length;
  } catch { return 0; }
}

export function AppHeader() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [unread, setUnread] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email || "");
    });
    setUnread(getUnreadCount());
  }, [supabase]);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[linear-gradient(180deg,rgba(10,18,13,.96),rgba(8,14,10,.92))] backdrop-blur-xl">
      <div className="mx-auto flex w-[min(calc(100%-36px),1280px)] items-center justify-between gap-4 py-3">
        
        {/* Left: Logo + Home */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[var(--muted)]">
              <path d="M3 9.5L9 3l6 6.5M5 7.5V15h3v-4h2v4h3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden text-[0.82rem] text-[var(--muted)] transition hover:text-[var(--text)] sm:block">
              Home
            </span>
          </Link>

          <span className="text-white/15">/</span>

          <Link
            href="/app"
            className="font-[family-name:var(--font-cormorant)] text-[1.15rem] font-semibold tracking-[-0.03em] text-[var(--text)]"
          >
            Stablelane<span className="text-[var(--accent)]">.</span>
          </Link>
        </div>

        {/* Center: search */}
        <div className="hidden flex-1 items-center justify-center sm:flex">
          <GlobalSearch />
        </div>

        {/* Right: user + quick actions */}
        <div className="flex items-center gap-2">
          {email && (
            <span className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] text-[var(--muted)] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {email}
            </span>
          )}
          <Link
            href="/app/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-[var(--muted)] transition hover:text-[var(--text)]"
            title="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5v2.5L2 10h12l-1.5-1.5V6A4.5 4.5 0 0 0 8 1.5ZM6.5 12a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="/app/notifications"
            className="relative rounded-full border border-white/8 bg-white/3 p-2 text-[var(--muted)] transition hover:text-[var(--text)]"
            title="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5a5 5 0 0 1 5 5v2.5l1 2H2l1-2V6.5a5 5 0 0 1 5-5ZM6.5 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[0.6rem] font-bold text-[#08100b]">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link
            href="/app/invoices/new"
            className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.82rem] font-semibold text-[var(--text)] transition hover:bg-white/5"
          >
            + Invoice
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.82rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
