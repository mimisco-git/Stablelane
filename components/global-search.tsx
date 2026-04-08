"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type Result = {
  id: string;
  type: "invoice" | "client" | "page";
  title: string;
  subtitle: string;
  href: string;
};

const QUICK_LINKS: Result[] = [
  { id: "q1", type: "page", title: "New invoice", subtitle: "Create invoice", href: "/app/invoices/new" },
  { id: "q2", type: "page", title: "Treasury", subtitle: "Manage wallets", href: "/app/treasury" },
  { id: "q3", type: "page", title: "Escrow Mini", subtitle: "Quick escrow", href: "/app/escrow-mini" },
  { id: "q4", type: "page", title: "Templates", subtitle: "Invoice templates", href: "/app/templates" },
  { id: "q5", type: "page", title: "Revenue Passport", subtitle: "Your score", href: "/app/passport" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    search(query.trim());
  }, [query]);

  async function search(q: string) {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const found: Result[] = [];

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [{ data: invoices }, { data: clients }] = await Promise.all([
          supabase.from("invoice_drafts")
            .select("id,title,client_name,amount,currency,status")
            .eq("owner_id", user.id)
            .ilike("title", `%${q}%`)
            .limit(5),
          supabase.from("clients")
            .select("id,client_name,client_email")
            .ilike("client_name", `%${q}%`)
            .limit(5),
        ]);

        (invoices || []).forEach((inv: any) => {
          found.push({
            id: inv.id,
            type: "invoice",
            title: inv.title,
            subtitle: `${inv.client_name} · ${Number(inv.amount || 0).toLocaleString()} ${inv.currency} · ${inv.status}`,
            href: `/app/invoices/${inv.id}`,
          });
        });

        (clients || []).forEach((cl: any) => {
          found.push({
            id: cl.id,
            type: "client",
            title: cl.client_name,
            subtitle: cl.client_email,
            href: `/client/${cl.id}`,
          });
        });
      }
    }

    setResults(found);
    setLoading(false);
  }

  function go(href: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  }

  const icon = (type: Result["type"]) => {
    if (type === "invoice") return "▣";
    if (type === "client") return "◎";
    return "◌";
  };

  const displayed = query.trim() ? results : QUICK_LINKS;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] text-[var(--muted)] transition hover:bg-white/5"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span className="hidden sm:block">Search</span>
        <span className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.68rem] sm:block">⌘K</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[15vh]" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(14,25,18,.98),rgba(10,18,13,.96))] shadow-[0_28px_90px_rgba(0,0,0,.7)] backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[var(--muted)]">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoices, clients, pages..."
                className="flex-1 bg-transparent text-[0.95rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
              />
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />}
              <button onClick={() => setOpen(false)} className="text-[0.8rem] text-[var(--muted-2)] hover:text-[var(--muted)]">Esc</button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {!query.trim() && (
                <div className="px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">Quick links</div>
              )}
              {query.trim() && results.length === 0 && !loading && (
                <div className="px-3 py-6 text-center text-[0.85rem] text-[var(--muted)]">No results for "{query}"</div>
              )}
              {displayed.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/3 text-[var(--muted)]">{icon(r.type)}</span>
                  <div>
                    <div className="text-[0.88rem] font-semibold text-[var(--text)]">{r.title}</div>
                    <div className="text-[0.75rem] text-[var(--muted)]">{r.subtitle}</div>
                  </div>
                  <span className="ml-auto text-[0.72rem] text-[var(--muted-2)]">{r.type}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-white/8 px-4 py-2.5 text-[0.72rem] text-[var(--muted-2)]">
              ↑↓ navigate · Enter select · Esc close
            </div>
          </div>
        </div>
      )}
    </>
  );
}