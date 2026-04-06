"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function WaitlistForm() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!supabase) {
      setStatus("error");
      setMessage("Service unavailable. Please try again later.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: trimmed });

      if (error) {
        if (error.code === "23505") {
          setStatus("success");
          setMessage("You are already on the list. We will be in touch.");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("You are on the list. We will reach out before launch.");
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.12)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="#c9ff60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[0.95rem] font-semibold text-[var(--accent)]">{message}</p>
        <p className="text-[0.82rem] text-[var(--muted)]">Share Stablelane with someone who needs it.</p>
        <button
          type="button"
          onClick={() => { setStatus("idle"); setMessage(""); }}
          className="mt-1 text-[0.8rem] text-[var(--muted)] underline underline-offset-2"
        >
          Add another email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setMessage(""); }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="your@email.com"
        aria-label="Email address for waitlist"
        disabled={status === "loading"}
        className="flex-1 rounded-full border border-white/8 bg-white/3 px-5 py-4 text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--line)] disabled:opacity-60"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={status === "loading"}
        className="rounded-full bg-[var(--accent)] px-6 py-4 text-center text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-70"
      >
        {status === "loading" ? "Joining..." : "Join waitlist"}
      </button>
      {status === "error" && message && (
        <p className="w-full text-center text-[0.82rem] text-[var(--danger)]">{message}</p>
      )}
    </div>
  );
}
