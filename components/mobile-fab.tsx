"use client";

import { useState } from "react";
import Link from "next/link";

const actions = [
  { label: "New invoice", href: "/app/invoices/new", icon: "▣" },
  { label: "Escrow Mini", href: "/app/escrow-mini", icon: "◈" },
  { label: "Treasury", href: "/app/treasury", icon: "◎" },
  { label: "Templates", href: "/app/templates", icon: "◌" },
];

export function MobileFAB() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 lg:hidden">
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-16 right-0 z-50 grid gap-2 min-w-[180px]">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(14,25,18,.98),rgba(10,18,13,.96))] px-4 py-3 text-[0.88rem] font-semibold text-[var(--text)] shadow-[0_8px_32px_rgba(0,0,0,.4)] backdrop-blur-xl transition hover:bg-white/5"
              >
                <span className="text-[var(--accent)]">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_32px_rgba(0,0,0,.5)] transition ${
          open
            ? "bg-white/15 text-[var(--text)]"
            : "bg-[var(--accent)] text-[#08100b]"
        }`}
      >
        <svg
          width="22" height="22" viewBox="0 0 22 22" fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
