"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RecurringSchedule = {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  currency: "USDC" | "EURC";
  cadence: "weekly" | "biweekly" | "monthly";
  description: string;
  milestones: { id: string; title: string; amount: string; detail: string }[];
  nextDue: string;
  active: boolean;
  generatedCount: number;
  createdAt: string;
};

const STORAGE_KEY = "stablelane_recurring";

function loadSchedules(): RecurringSchedule[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveSchedules(s: RecurringSchedule[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function nextDueDate(cadence: RecurringSchedule["cadence"]): string {
  const d = new Date();
  if (cadence === "weekly") d.setDate(d.getDate() + 7);
  else if (cadence === "biweekly") d.setDate(d.getDate() + 14);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

function cadenceLabel(c: RecurringSchedule["cadence"]) {
  return c === "weekly" ? "Weekly" : c === "biweekly" ? "Every 2 weeks" : "Monthly";
}

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function RecurringInvoices() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    currency: "USDC" as "USDC" | "EURC",
    cadence: "monthly" as RecurringSchedule["cadence"],
    description: "",
  });
  const router = useRouter();

  useEffect(() => { setSchedules(loadSchedules()); }, []);

  function showMsg(text: string) { setMessage(text); setTimeout(() => setMessage(""), 3000); }

  function createSchedule() {
    if (!form.name || !form.clientName || !form.amount) {
      showMsg("Fill in name, client, and amount."); return;
    }
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { showMsg("Enter a valid amount."); return; }

    const schedule: RecurringSchedule = {
      id: `rec_${Date.now()}`,
      name: form.name,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      amount: form.amount,
      currency: form.currency,
      cadence: form.cadence,
      description: form.description,
      milestones: [{ id: "m1", title: "Delivery", amount: form.amount, detail: form.description }],
      nextDue: nextDueDate(form.cadence),
      active: true,
      generatedCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [schedule, ...schedules];
    setSchedules(updated);
    saveSchedules(updated);
    setCreating(false);
    setForm({ name: "", clientName: "", clientEmail: "", amount: "", currency: "USDC", cadence: "monthly", description: "" });
    showMsg("Recurring schedule created.");
  }

  function generateNow(schedule: RecurringSchedule) {
    // Load into sessionStorage for invoice builder
    const template = {
      name: schedule.name,
      description: schedule.description,
      currency: schedule.currency,
      paymentMode: "Milestone escrow",
      milestones: schedule.milestones,
      splits: [],
    };
    sessionStorage.setItem("stablelane_template_load", JSON.stringify(template));
    sessionStorage.setItem("stablelane_prefill_client", JSON.stringify({
      clientName: schedule.clientName,
      clientEmail: schedule.clientEmail,
      amount: schedule.amount,
      title: `${schedule.name} - ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    }));
    // Update next due and count
    const updated = schedules.map((s) =>
      s.id === schedule.id
        ? { ...s, generatedCount: s.generatedCount + 1, nextDue: nextDueDate(s.cadence) }
        : s
    );
    setSchedules(updated);
    saveSchedules(updated);
    router.push("/app/invoices/new?from=recurring");
  }

  function toggleActive(id: string) {
    const updated = schedules.map((s) => s.id === id ? { ...s, active: !s.active } : s);
    setSchedules(updated);
    saveSchedules(updated);
  }

  function deleteSchedule(id: string) {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  }

  const dueCount = schedules.filter((s) => s.active && daysUntil(s.nextDue) <= 3).length;

  return (
    <div className="grid gap-4">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active schedules", value: schedules.filter((s) => s.active).length },
          { label: "Due this week", value: dueCount, highlight: dueCount > 0 },
          { label: "Total generated", value: schedules.reduce((sum, s) => sum + s.generatedCount, 0) },
        ].map((s) => (
          <div key={s.label} className={`rounded-[18px] border p-4 ${s.highlight ? "border-[var(--line)] bg-[rgba(201,255,96,.06)]" : "border-white/8 bg-white/3"}`}>
            <div className={`font-[family-name:var(--font-cormorant)] text-[2rem] tracking-[-0.04em] ${s.highlight ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>{s.value}</div>
            <div className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Schedule list */}
      {schedules.length > 0 && (
        <div className="grid gap-3">
          {schedules.map((s) => {
            const days = daysUntil(s.nextDue);
            const urgent = s.active && days <= 3;
            return (
              <div key={s.id} className={`rounded-[20px] border p-5 ${urgent ? "border-[var(--line)] bg-[rgba(201,255,96,.04)]" : "border-white/8 bg-white/3"}`}>
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.name}</span>
                      {!s.active && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.68rem] font-bold uppercase text-[var(--muted-2)]">Paused</span>}
                      {urgent && <span className="rounded-full bg-[rgba(201,255,96,.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase text-[var(--accent)]">Due soon</span>}
                    </div>
                    <div className="text-[0.82rem] text-[var(--muted)]">
                      {s.clientName} · {cadenceLabel(s.cadence)} · {parseFloat(s.amount).toLocaleString()} {s.currency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.82rem] font-semibold">{s.active ? `${days} day${days !== 1 ? "s" : ""} until next` : "Paused"}</div>
                    <div className="text-[0.72rem] text-[var(--muted)]">Generated {s.generatedCount}x</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => generateNow(s)} className="rounded-xl bg-[var(--accent)] px-3 py-2 text-[0.82rem] font-bold text-[#08100b] transition hover:-translate-y-px">
                    Generate invoice now
                  </button>
                  <button onClick={() => toggleActive(s.id)} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]">
                    {s.active ? "Pause" : "Resume"}
                  </button>
                  <button onClick={() => deleteSchedule(s.id)} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--muted-2)] transition hover:text-red-400">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create form */}
      {creating ? (
        <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.04)] p-5">
          <h2 className="mb-4 text-base font-bold">New recurring schedule</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Schedule name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Monthly retainer - Acme" className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Client name</label>
              <input value={form.clientName} onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))} placeholder="Client name" className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Client email</label>
              <input type="email" value={form.clientEmail} onChange={(e) => setForm((p) => ({ ...p, clientEmail: e.target.value }))} placeholder="client@example.com" className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Amount (USDC)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Cadence</label>
              <select value={form.cadence} onChange={(e) => setForm((p) => ({ ...p, cadence: e.target.value as RecurringSchedule["cadence"] }))} className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)]">
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 weeks</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Description (optional)</label>
              <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="What does this recurring engagement cover?" className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={createSchedule} className="rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.88rem] font-bold text-[#08100b] transition hover:-translate-y-px">Create schedule</button>
            <button onClick={() => setCreating(false)} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] font-semibold text-[var(--muted)]">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setCreating(true)} className="rounded-[20px] border border-dashed border-white/15 bg-white/[.015] p-6 text-center transition hover:border-white/25 hover:bg-white/3">
          <div className="mb-1 text-2xl text-[var(--muted-2)]">+</div>
          <div className="text-[0.9rem] font-semibold text-[var(--muted)]">New recurring schedule</div>
          <div className="text-[0.78rem] text-[var(--muted-2)]">Set up a weekly, biweekly, or monthly invoice</div>
        </button>
      )}

      {message && (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] font-semibold text-[var(--accent)]">{message}</div>
      )}
    </div>
  );
}