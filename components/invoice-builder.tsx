"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upsertLocalInvoice, readLocalInvoices } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { fetchClients, fetchRemoteInvoiceDraftById, saveRemoteInvoiceDraft, updateRemoteInvoiceDraft } from "@/lib/supabase-data";
import type { ClientRecord, InvoiceDraft, RemoteInvoiceDraftRow } from "@/lib/types";

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

type InvoiceBuilderProps = {
  draftId?: string;
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

function normalizeRemoteInvoice(row: RemoteInvoiceDraftRow): InvoiceDraft {
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientId: row.client_id || null,
    workspaceName: row.workspace_name || null,
    amount: String(row.amount ?? 0),
    currency: row.currency,
    paymentMode: row.payment_mode,
    dueDate: row.due_date || "Not set",
    reference: row.reference || "",
    description: row.description || "",
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
    splits: Array.isArray(row.splits) ? row.splits : [],
    createdAt: row.created_at,
    status: row.status,
  };
}

function invoiceToForm(invoice: InvoiceDraft): FormState {
  return {
    title: invoice.title,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    amount: invoice.amount,
    currency: invoice.currency,
    paymentMode: invoice.paymentMode,
    dueDate: invoice.dueDate === "Not set" ? "" : invoice.dueDate,
    reference: invoice.reference || "",
    description: invoice.description || "",
    milestones: invoice.milestones?.length ? invoice.milestones : initialState.milestones,
    splits: invoice.splits?.length ? invoice.splits : initialState.splits,
  };
}

export function InvoiceBuilder({ draftId }: InvoiceBuilderProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [form, setForm] = useState<FormState>(initialState);
  const [message, setMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(Boolean(draftId));
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [activeDraft, setActiveDraft] = useState<InvoiceDraft | null>(null);

  const totalSplit = useMemo(
    () => form.splits.reduce((sum, item) => sum + Number(item.percent || 0), 0),
    [form.splits]
  );

  const totalMilestoneAmount = useMemo(() => {
    return form.milestones.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [form.milestones]);

  const resolvedClientLink = useMemo(() => {
    const selected = clients.find((item) => item.id === selectedClientId);
    if (selected) return selected;
    const byEmail = clients.find((item) => item.client_email.toLowerCase() === form.clientEmail.toLowerCase());
    return byEmail || null;
  }, [clients, selectedClientId, form.clientEmail]);

  useEffect(() => {
    let mounted = true;

    async function loadClientsAndDraft() {
      try {
        const data = await fetchClients();
        if (mounted) setClients(data);
      } catch {
        if (mounted) setClients([]);
      }

      if (!draftId) {
        if (mounted) setLoadingDraft(false);
        return;
      }

      let loaded: InvoiceDraft | null = null;
      try {
        const remote = await fetchRemoteInvoiceDraftById(draftId);
        if (remote) loaded = normalizeRemoteInvoice(remote);
      } catch {
        // ignore and fall back
      }

      if (!loaded) {
        loaded = readLocalInvoices().find((item) => item.id === draftId) || null;
      }

      if (mounted) {
        if (loaded) {
          setActiveDraft(loaded);
          setForm(invoiceToForm(loaded));
          if (loaded.clientId) setSelectedClientId(loaded.clientId);
        } else {
          setMessage("Draft could not be found. You can create a new invoice instead.");
        }
        setLoadingDraft(false);
      }
    }

    loadClientsAndDraft();
    return () => {
      mounted = false;
    };
  }, [draftId]);

  function applySavedClient(clientId: string) {
    setSelectedClientId(clientId);
    const match = clients.find((item) => item.id === clientId);
    if (!match) return;
    setForm((prev) => ({
      ...prev,
      clientName: match.client_name,
      clientEmail: match.client_email,
    }));
  }

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

  async function saveDraft() {
    const selectedClient = resolvedClientLink;

    const draft: InvoiceDraft = {
      id: activeDraft?.id || makeId("inv"),
      title: form.title || "Untitled invoice",
      clientName: form.clientName || "Unnamed client",
      clientEmail: form.clientEmail || "",
      clientId: selectedClient?.id || activeDraft?.clientId || null,
      workspaceName: selectedClient?.workspace_name || activeDraft?.workspaceName || null,
      amount: form.amount || "0",
      currency: form.currency,
      paymentMode: form.paymentMode,
      dueDate: form.dueDate || "Not set",
      reference: form.reference || "",
      description: form.description || "",
      milestones: form.milestones,
      splits: form.splits,
      createdAt: activeDraft?.createdAt || new Date().toISOString(),
      status: activeDraft?.status || "Draft",
    };

    setSaving(true);
    try {
      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (activeDraft?.id) {
            await updateRemoteInvoiceDraft(activeDraft.id, draft);
            setMessage("Draft updated in Supabase.");
          } else {
            await saveRemoteInvoiceDraft(draft);
            setMessage("Draft saved to Supabase.");
          }
          setActiveDraft(draft);
          setTimeout(() => setMessage(""), 3200);
          router.push("/app/invoices");
          return;
        }
      }

      upsertLocalInvoice(draft);
      setActiveDraft(draft);
      setMessage(activeDraft ? "Draft updated in your browser." : "Draft saved in your browser.");
      setTimeout(() => setMessage(""), 3200);
      router.push("/app/invoices");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Saving failed.";
      setMessage(text);
    } finally {
      setSaving(false);
    }
  }

  if (loadingDraft) {
    return (
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5 text-[0.9rem] text-[var(--muted)]">
        Loading draft...
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.06fr_.94fr]">
      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 text-base font-bold tracking-normal">
              {activeDraft ? "Edit invoice draft" : "Invoice details"}
            </h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              {activeDraft
                ? "Update the draft, refine milestones, or adjust payout splits before connecting it to escrow."
                : "Create an invoice with milestones and client terms. Drafts save automatically when you are signed in."}
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

            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Saved clients</h3>
                  <p className="text-[0.82rem] leading-6 text-[var(--muted)]">
                    Pick an existing client to fill the invoice faster, or keep typing manually.
                  </p>
                </div>
                <Link href="/app/clients" className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.82rem] font-semibold text-[var(--text)]">
                  Manage clients
                </Link>
              </div>

              {clients.length ? (
                <select
                  value={selectedClientId}
                  onChange={(e) => applySavedClient(e.target.value)}
                  className="w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
                >
                  <option value="">Select a saved client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.client_name} · {client.client_email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[0.84rem] text-[var(--muted)]">
                  No saved clients yet. Add one in the Clients page to reuse it here.
                </div>
              )}
            </div>

            <div className="rounded-[20px] border border-white/8 bg-white/3 p-4">
              <div className="mb-2 text-[0.9rem] font-semibold text-[var(--text)]">Client link</div>
              {resolvedClientLink ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--text)]">{resolvedClientLink.client_name}</div>
                    <div className="text-[0.82rem] text-[var(--muted)]">{resolvedClientLink.client_email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClientId("")}
                    className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.78rem] font-semibold text-[var(--text)]"
                  >
                    Clear link
                  </button>
                </div>
              ) : (
                <div className="text-[0.84rem] text-[var(--muted)]">
                  This invoice is currently unlinked. Select a saved client above, or use an email that matches an existing client record.
                </div>
              )}
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
              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
              >
                {saving ? "Saving..." : activeDraft ? "Update draft" : "Save draft"}
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
            activeDraft
              ? "You are editing an existing draft. Saving now updates the same record instead of creating a new one."
              : "New drafts save to Supabase when you are signed in, or to browser storage when you are not.",
            "Saved clients now feed directly into invoice creation so the workflow feels closer to a real workspace product.",
            "The next step after this is connecting approved invoices to real Arc testnet escrow contracts.",
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
