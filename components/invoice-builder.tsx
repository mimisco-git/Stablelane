"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { writeLocalInvoices, readLocalInvoices } from "@/lib/storage";
import type { InvoiceDraft } from "@/lib/types";

type FormState = {
  title: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  currency: "USDC" | "EURC";
  paymentMode: "Milestone escrow" | "Direct payment";
  dueDate: string;
  reference: string;
  description: string;
  milestones: Array<{
    id: string;
    title: string;
    amount: string;
    detail: string;
  }>;
  splits: Array<{
    id: string;
    member: string;
    percent: number;
  }>;
};

const initialState: FormState = {
  title: "",
  clientName: "",
  clientEmail: "",
  amount: "",
  currency: "USDC",
  paymentMode: "Milestone escrow",
  dueDate: "",
  reference: "",
  description: "",
  milestones: [
    { id: "m1", title: "Milestone 1", amount: "", detail: "Discovery and strategy" },
    { id: "m2", title: "Milestone 2", amount: "", detail: "Core delivery" },
  ],
  splits: [
    { id: "s1", member: "Designer", percent: 60 },
    { id: "s2", member: "Developer", percent: 30 },
    { id: "s3", member: "PM", percent: 10 },
  ],
};

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function InvoiceBuilder() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [message, setMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const totalSplit = useMemo(
    () => form.splits.reduce((sum, item) => sum + Number(item.percent || 0), 0),
    [form.splits]
  );

  const totalMilestoneAmount = useMemo(() => {
    return form.milestones.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [form.milestones]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateMilestone(id: string, key: "title" | "amount" | "detail", value: string) {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  }

  function addMilestone() {
    setForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: makeId("m"),
          title: `Milestone ${prev.milestones.length + 1}`,
          amount: "",
          detail: "Describe what gets delivered here",
        },
      ],
    }));
  }

  function removeMilestone(id: string) {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((item) => item.id !== id),
    }));
  }

  function updateSplit(id: string, key: "member" | "percent", value: string | number) {
    setForm((prev) => ({
      ...prev,
      splits: prev.splits.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  }

  function addSplit() {
    setForm((prev) => ({
      ...prev,
      splits: [...prev.splits, { id: makeId("s"), member: "New collaborator", percent: 0 }],
    }));
  }

  function removeSplit(id: string) {
    setForm((prev) => ({
      ...prev,
      splits: prev.splits.filter((item) => item.id !== id),
    }));
  }

  function saveDraft() {
    const draft: InvoiceDraft = {
      id: makeId("inv"),
      title: form.title || "Untitled invoice",
      clientName: form.clientName || "Unnamed client",
      clientEmail: form.clientEmail || "",
      amount: form.amount || "0",
      currency: form.currency,
      paymentMode: form.paymentMode,
      dueDate: form.dueDate || "Not set",
      reference: form.reference || "",
      description: form.description || "",
      milestones: form.milestones,
      splits: form.splits,
      createdAt: new Date().toISOString(),
      status: "Draft",
    };

    const existing = readLocalInvoices();
    writeLocalInvoices([draft, ...existing]);
    setMessage("Draft saved locally. Open the invoices page to review it.");
    setTimeout(() => setMessage(""), 2800);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.06fr_.94fr]">
      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 text-base font-bold tracking-normal">Invoice details</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              This stage turns the invoice screen into a working local draft builder so you can test flow and layout now.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode((value) => !value)}
            className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.84rem] font-semibold text-[var(--text)]"
          >
            {previewMode ? "Edit form" : "Preview invoice"}
          </button>
        </div>

        {!previewMode ? (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Invoice title", form.title, "title"],
                ["Client name", form.clientName, "clientName"],
                ["Client email", form.clientEmail, "clientEmail"],
                ["Total amount", form.amount, "amount"],
                ["Due date", form.dueDate, "dueDate"],
                ["Reference", form.reference, "reference"],
              ].map(([label, value, key]) => (
                <label key={label} className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
                  <span>{label}</span>
                  <input
                    value={value}
                    onChange={(e) => updateField(key as keyof FormState, e.target.value as never)}
                    placeholder={label}
                    className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
                <span>Currency</span>
                <select
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value as FormState["currency"])}
                  className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
                >
                  <option>USDC</option>
                  <option>EURC</option>
                </select>
              </label>

              <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
                <span>Payment mode</span>
                <select
                  value={form.paymentMode}
                  onChange={(e) => updateField("paymentMode", e.target.value as FormState["paymentMode"])}
                  className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
                >
                  <option>Milestone escrow</option>
                  <option>Direct payment</option>
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
              <span>Description</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Outline scope, delivery terms, and payment expectations."
                className="rounded-[20px] border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
              />
            </label>

            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Milestones</h3>
                  <p className="text-[0.82rem] leading-6 text-[var(--muted)]">
                    Build the release structure here. Total milestone value currently: {totalMilestoneAmount || 0}
                  </p>
                </div>
                <button type="button" onClick={addMilestone} className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-bold text-[#08100b]">
                  Add milestone
                </button>
              </div>

              <div className="grid gap-3">
                {form.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong>{milestone.title || `Milestone ${index + 1}`}</strong>
                      {form.milestones.length > 1 ? (
                        <button type="button" onClick={() => removeMilestone(milestone.id)} className="text-[0.8rem] font-semibold text-[var(--muted)]">
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                        placeholder="Milestone title"
                        className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                      />
                      <input
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(milestone.id, "amount", e.target.value)}
                        placeholder="Amount"
                        className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={milestone.detail}
                      onChange={(e) => updateMilestone(milestone.id, "detail", e.target.value)}
                      placeholder="What gets delivered in this milestone?"
                      className="mt-3 w-full rounded-[18px] border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Payout split</h3>
                  <p className="text-[0.82rem] leading-6 text-[var(--muted)]">
                    Split total currently: {totalSplit}% {totalSplit === 100 ? "ready" : "needs adjustment"}
                  </p>
                </div>
                <button type="button" onClick={addSplit} className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.82rem] font-bold text-[var(--text)]">
                  Add member
                </button>
              </div>

              <div className="grid gap-3">
                {form.splits.map((split) => (
                  <div key={split.id} className="grid gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 md:grid-cols-[1fr_150px_auto] md:items-center">
                    <input
                      value={split.member}
                      onChange={(e) => updateSplit(split.id, "member", e.target.value)}
                      placeholder="Member name"
                      className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                    />
                    <input
                      value={split.percent}
                      onChange={(e) => updateSplit(split.id, "percent", Number(e.target.value))}
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Percent"
                      className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                    />
                    {form.splits.length > 1 ? (
                      <button type="button" onClick={() => removeSplit(split.id)} className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.82rem] font-semibold text-[var(--text)]">
                        Remove
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={saveDraft} className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
                Save draft locally
              </button>
              <button
                type="button"
                onClick={() => router.push("/app/invoices")}
                className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]"
              >
                Open invoices
              </button>
            </div>

            {message ? (
              <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] text-[var(--accent)]">
                {message}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Invoice</div>
              <div className="mb-1 text-[1.15rem] font-semibold text-[var(--text)]">{form.title || "Untitled invoice"}</div>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                {form.clientName || "Unnamed client"} · {form.clientEmail || "No client email yet"}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Amount</div>
                <div className="text-[1.15rem] font-semibold">{form.amount || "0"} {form.currency}</div>
              </div>
              <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Mode</div>
                <div className="text-[1.15rem] font-semibold">{form.paymentMode}</div>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-2 font-semibold">Scope summary</div>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                {form.description || "No description yet. Add a brief scope summary so the client sees exactly what is included."}
              </p>
            </div>

            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-3 font-semibold">Milestones</div>
              <div className="grid gap-3">
                {form.milestones.map((milestone) => (
                  <div key={milestone.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <strong>{milestone.title || "Untitled milestone"}</strong>
                      <span className="font-semibold">{milestone.amount || "0"} {form.currency}</span>
                    </div>
                    <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{milestone.detail || "No milestone detail yet."}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-3 font-semibold">Payout split</div>
              <div className="grid gap-3">
                {form.splits.map((split) => (
                  <div key={split.id} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{split.member || "Unnamed collaborator"}</strong>
                      <span className="font-semibold">{split.percent}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
                      <span
                        className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                        style={{ width: `${Math.max(0, Math.min(100, split.percent))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-4 text-base font-bold tracking-normal">Builder notes</h2>
        <div className="grid gap-3">
          {[
            "Drafts save locally in the browser so you can keep testing without a backend yet.",
            "The next build should replace local drafts with Supabase records and real invoice states.",
            "After data persistence, we connect invoice funding and milestone release to Arc testnet contracts.",
          ].map((note) => (
            <div key={note} className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
              {note}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
