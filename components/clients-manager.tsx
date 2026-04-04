"use client";

import { useEffect, useState } from "react";
import { createClient, fetchClients } from "@/lib/supabase-data";
import type { ClientRecord } from "@/lib/types";

export function ClientsManager() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_wallet: "",
    notes: "",
  });

  async function loadClients() {
    try {
      const data = await fetchClients();
      setClients(data);
    } catch {
      setMessage("Could not load clients yet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await createClient(form);
      setForm({ client_name: "", client_email: "", client_wallet: "", notes: "" });
      setMessage("Client saved.");
      await loadClients();
    } catch {
      setMessage("Client save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
      <form onSubmit={onSubmit} className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-4 text-base font-bold tracking-normal">Add client</h2>
        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Client name</span>
            <input
              value={form.client_name}
              onChange={(e) => setForm((prev) => ({ ...prev, client_name: e.target.value }))}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>
          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Client email</span>
            <input
              type="email"
              value={form.client_email}
              onChange={(e) => setForm((prev) => ({ ...prev, client_email: e.target.value }))}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>
          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Wallet address</span>
            <input
              value={form.client_wallet}
              onChange={(e) => setForm((prev) => ({ ...prev, client_wallet: e.target.value }))}
              placeholder="Optional"
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>
          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Notes</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="rounded-[18px] border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save client"}
          </button>
        </div>
        {message ? (
          <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] text-[var(--accent)]">
            {message}
          </div>
        ) : null}
      </form>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-4 text-base font-bold tracking-normal">Clients</h2>
        {loading ? (
          <div className="text-[0.9rem] text-[var(--muted)]">Loading clients...</div>
        ) : clients.length ? (
          <div className="grid gap-3">
            {clients.map((client) => (
              <div key={client.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 font-semibold">{client.client_name}</div>
                <div className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  {client.client_email}
                  {client.client_wallet ? ` · ${client.client_wallet}` : ""}
                </div>
                {client.notes ? (
                  <div className="mt-2 text-[0.82rem] leading-6 text-[var(--muted)]">{client.notes}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[0.9rem] text-[var(--muted)]">No clients saved yet.</div>
        )}
      </section>
    </div>
  );
}
