"use client";

import { useEffect, useState } from "react";
import { ensureWorkspaceProfile, fetchWorkspaceProfile, saveWorkspaceProfile } from "@/lib/supabase-data";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function WorkspaceSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    workspace_name: "",
    role_type: "Freelancer" as "Freelancer" | "Agency",
    default_currency: "USDC" as "USDC" | "EURC",
    wallet_address: "",
    contact_email: "",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        await ensureWorkspaceProfile();
        const profile = await fetchWorkspaceProfile();

        // Also get the auth email as default contact email
        const supabase = getSupabaseBrowserClient();
        let authEmail = "";
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          authEmail = user?.email || "";
        }

        if (!mounted || !profile) return;
        setForm({
          workspace_name: profile.workspace_name || "",
          role_type: profile.role_type || "Freelancer",
          default_currency: profile.default_currency || "USDC",
          wallet_address: profile.wallet_address || "",
          contact_email: (profile as any).contact_email || authEmail,
        });
      } catch {
        if (mounted) setMessage("Could not load workspace settings yet.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await saveWorkspaceProfile({
        workspace_name: form.workspace_name,
        role_type: form.role_type,
        default_currency: form.default_currency,
        wallet_address: form.wallet_address || null,
      });

      // Save contact_email separately since it may not be in saveWorkspaceProfile
      const supabase = getSupabaseBrowserClient();
      if (supabase && form.contact_email) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("workspace_profiles")
            .update({ contact_email: form.contact_email })
            .eq("user_id", user.id);
        }
      }

      setMessage("Workspace settings saved.");
    } catch {
      setMessage("Saving failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5 text-[0.9rem] text-[var(--muted)]">
        Loading workspace settings...
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
          <span>Workspace name</span>
          <input
            value={form.workspace_name}
            onChange={(e) => setForm((prev) => ({ ...prev, workspace_name: e.target.value }))}
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--line)]"
          />
        </label>

        <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
          <span>Role type</span>
          <select
            value={form.role_type}
            onChange={(e) => setForm((prev) => ({ ...prev, role_type: e.target.value as "Freelancer" | "Agency" }))}
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
          >
            <option>Freelancer</option>
            <option>Agency</option>
          </select>
        </label>

        <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
          <span>Default currency</span>
          <select
            value={form.default_currency}
            onChange={(e) => setForm((prev) => ({ ...prev, default_currency: e.target.value as "USDC" | "EURC" }))}
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
          >
            <option>USDC</option>
            <option>EURC</option>
          </select>
        </label>

        <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
          <span>Primary wallet address <span className="text-[0.78rem] text-[var(--muted-2)] font-normal">(Arc testnet)</span></span>
          <input
            value={form.wallet_address}
            onChange={(e) => setForm((prev) => ({ ...prev, wallet_address: e.target.value }))}
            placeholder="0x..."
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 font-mono text-[0.88rem] text-[var(--text)] outline-none focus:border-[var(--line)]"
          />
        </label>

        <label className="grid gap-2 text-[0.84rem] text-[var(--muted)] md:col-span-2">
          <span>Notification email <span className="text-[0.78rem] text-[var(--muted-2)] font-normal">(receive alerts when clients pay)</span></span>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))}
            placeholder="you@example.com"
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--line)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save workspace"}
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] text-[var(--accent)]">
          {message}
        </div>
      )}
    </form>
  );
}
