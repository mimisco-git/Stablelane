"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type NotifType = "payment" | "escrow" | "release" | "invoice" | "system";

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  detail: string;
  href: string | null;
  read: boolean;
  createdAt: string;
  amount?: string;
  currency?: string;
};

const STORAGE_KEY = "stablelane_notifications";

function loadLocal(): Notification[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveLocal(n: Notification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
}

function toneFor(type: NotifType) {
  if (type === "payment") return "bg-[rgba(201,255,96,.12)] text-[var(--accent)]";
  if (type === "release") return "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]";
  if (type === "escrow") return "bg-[rgba(201,255,96,.12)] text-[var(--accent)]";
  return "bg-white/5 text-[var(--muted)]";
}

function iconFor(type: NotifType) {
  if (type === "payment") return "◈";
  if (type === "release") return "◎";
  if (type === "escrow") return "▣";
  return "◌";
}

export function NotificationCenter() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const local = loadLocal();
    const supabase = getSupabaseBrowserClient();

    let remote: Notification[] = [];
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: auditRows } = await supabase
            .from("workspace_audit_events")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

          remote = (auditRows || []).map((row: any) => ({
            id: `audit_${row.id}`,
            type: (row.event_type?.includes("payment") ? "payment"
              : row.event_type?.includes("release") ? "release"
              : row.event_type?.includes("escrow") ? "escrow"
              : "system") as NotifType,
            title: row.title || row.event_type || "Workspace event",
            detail: row.detail || row.description || "",
            href: row.invoice_id ? `/app/invoices/${row.invoice_id}` : null,
            read: Boolean(row.read_at),
            createdAt: row.created_at,
            amount: row.amount ? String(row.amount) : undefined,
            currency: row.currency || undefined,
          }));
        }
      } catch {}
    }

    // Merge: deduplicate by id, local takes precedence for read state
    const localIds = new Set(local.map((n) => n.id));
    const merged = [
      ...local,
      ...remote.filter((r) => !localIds.has(r.id)),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setNotifs(merged);
    setLoading(false);
  }

  function markAllRead() {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setNotifs(updated);
    saveLocal(updated.filter((n) => n.id.startsWith("notif_")));
  }

  function markRead(id: string) {
    const updated = notifs.map((n) => n.id === id ? { ...n, read: true } : n);
    setNotifs(updated);
    saveLocal(updated.filter((n) => n.id.startsWith("notif_")));
  }

  const unread = notifs.filter((n) => !n.read).length;
  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);

  const tabClass = (t: typeof filter) =>
    `px-3 py-2 rounded-xl text-[0.82rem] font-semibold transition ${
      filter === t ? "bg-[var(--accent)] text-[#08100b]" : "text-[var(--muted)] hover:bg-white/5"
    }`;

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[0.88rem] text-[var(--muted)]">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </span>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]">
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 rounded-[16px] border border-white/8 bg-white/3 p-2">
        {(["all", "payment", "escrow", "release", "system"] as const).map((t) => (
          <button key={t} className={tabClass(t)} onClick={() => setFilter(t)}>
            {t === "all" ? `All (${notifs.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="py-10 text-center text-[0.9rem] text-[var(--muted)]">Loading notifications...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-10 text-center">
          <div className="mb-2 text-3xl opacity-20">◌</div>
          <p className="text-[0.88rem] text-[var(--muted)]">
            {filter === "all"
              ? "No notifications yet. They will appear here when clients pay or milestones are released."
              : `No ${filter} notifications.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`relative rounded-2xl border p-4 transition ${
                !n.read
                  ? "border-[var(--line)] bg-[rgba(201,255,96,.04)]"
                  : "border-white/8 bg-white/3"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${toneFor(n.type)}`}>
                  {iconFor(n.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[0.88rem] font-semibold ${!n.read ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  {n.detail && (
                    <p className="mt-0.5 text-[0.78rem] leading-5 text-[var(--muted)]">{n.detail}</p>
                  )}
                  {n.amount && (
                    <span className="mt-1 inline-block font-semibold text-[0.82rem] text-[var(--accent)]">
                      {n.amount} {n.currency}
                    </span>
                  )}
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[0.72rem] text-[var(--muted-2)]">
                      {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {n.href && (
                      <Link
                        href={n.href}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[0.72rem] font-semibold text-[var(--accent)] underline underline-offset-2"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}