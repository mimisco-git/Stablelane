"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MilestoneTemplate = {
  id: string;
  title: string;
  amount: string;
  detail: string;
};

type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  currency: "USDC" | "EURC";
  paymentMode: "Milestone escrow" | "Direct payment";
  milestones: MilestoneTemplate[];
  splits: { id: string; member: string; percent: number }[];
  createdAt: string;
  usageCount: number;
};

const STORAGE_KEY = "stablelane_invoice_templates";

function loadTemplates(): InvoiceTemplate[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveTemplates(templates: InvoiceTemplate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

const STARTER_TEMPLATES: InvoiceTemplate[] = [
  {
    id: "tpl_design_sprint",
    name: "Design sprint",
    description: "3-milestone design project: discovery, design, handoff.",
    currency: "USDC",
    paymentMode: "Milestone escrow",
    milestones: [
      { id: "m1", title: "Discovery & strategy", amount: "1600", detail: "Research, competitive analysis, and project brief." },
      { id: "m2", title: "Design & iteration", amount: "1600", detail: "UI design, feedback rounds, and refinement." },
      { id: "m3", title: "Handoff & assets", amount: "1600", detail: "Final files, style guide, and developer handoff." },
    ],
    splits: [
      { id: "s1", member: "Designer", percent: 80 },
      { id: "s2", member: "PM", percent: 20 },
    ],
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: "tpl_dev_retainer",
    name: "Dev retainer",
    description: "Monthly development retainer with two delivery milestones.",
    currency: "USDC",
    paymentMode: "Milestone escrow",
    milestones: [
      { id: "m1", title: "Mid-month delivery", amount: "2500", detail: "Features and fixes delivered by the 15th." },
      { id: "m2", title: "End-of-month delivery", amount: "2500", detail: "Sprint wrap, review, and deployment." },
    ],
    splits: [
      { id: "s1", member: "Developer", percent: 85 },
      { id: "s2", member: "PM", percent: 15 },
    ],
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: "tpl_content_package",
    name: "Content package",
    description: "4-piece content creation with strategy and delivery milestones.",
    currency: "USDC",
    paymentMode: "Milestone escrow",
    milestones: [
      { id: "m1", title: "Strategy & briefs", amount: "800", detail: "Content strategy and 4 topic briefs approved." },
      { id: "m2", title: "Draft delivery", amount: "800", detail: "All 4 pieces drafted and submitted for review." },
      { id: "m3", title: "Final delivery", amount: "400", detail: "Revised and final content ready to publish." },
    ],
    splits: [
      { id: "s1", member: "Writer", percent: 75 },
      { id: "s2", member: "Editor", percent: 25 },
    ],
    createdAt: new Date().toISOString(),
    usageCount: 0,
  },
];

export function InvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = loadTemplates();
    if (saved.length === 0) {
      setTemplates(STARTER_TEMPLATES);
      saveTemplates(STARTER_TEMPLATES);
    } else {
      setTemplates(saved);
    }
  }, []);

  function useTemplate(template: InvoiceTemplate) {
    // Save template data to sessionStorage so invoice builder can pick it up
    if (typeof window !== "undefined") {
      sessionStorage.setItem("stablelane_template_load", JSON.stringify(template));
      // Increment usage count
      const updated = templates.map((t) =>
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
      );
      setTemplates(updated);
      saveTemplates(updated);
    }
    router.push("/app/invoices/new?from=template");
  }

  function deleteTemplate(id: string) {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
  }

  function duplicateTemplate(template: InvoiceTemplate) {
    const copy: InvoiceTemplate = {
      ...template,
      id: `tpl_${Date.now()}`,
      name: `${template.name} (copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [copy, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    setMessage(`"${copy.name}" created.`);
    setTimeout(() => setMessage(""), 3000);
  }

  const totalAmount = (t: InvoiceTemplate) =>
    t.milestones.reduce((sum, m) => sum + parseFloat(m.amount || "0"), 0);

  return (
    <div className="grid gap-4">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Templates saved", value: templates.length },
          { label: "Total uses", value: templates.reduce((sum, t) => sum + t.usageCount, 0) },
          { label: "Most used", value: templates.sort((a, b) => b.usageCount - a.usageCount)[0]?.name.split(" ").slice(0, 2).join(" ") || "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-1 font-[family-name:var(--font-cormorant)] text-[2rem] tracking-[-0.04em] text-[var(--accent)]">{s.value}</div>
            <div className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Template list */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="rounded-[20px] border border-white/8 bg-white/3 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="mb-1 font-semibold">{template.name}</div>
                <div className="text-[0.8rem] text-[var(--muted)]">{template.description}</div>
              </div>
              <div className="shrink-0 rounded-full border border-white/8 bg-white/3 px-2 py-1 text-[0.68rem] font-bold text-[var(--muted-2)]">
                {template.usageCount}x
              </div>
            </div>

            <div className="grid gap-1.5">
              {template.milestones.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem]">
                  <span className="text-[var(--muted)]">{m.title || `Milestone ${i + 1}`}</span>
                  <span className="font-semibold">{parseFloat(m.amount || "0").toLocaleString()} {template.currency}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-1 text-[0.82rem]">
                <span className="font-bold text-[var(--muted-2)]">Total</span>
                <span className="font-bold text-[var(--accent)]">{totalAmount(template).toLocaleString()} {template.currency}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/8 pt-3">
              <button
                onClick={() => useTemplate(template)}
                className="flex-1 rounded-xl bg-[var(--accent)] px-3 py-2.5 text-[0.85rem] font-bold text-[#08100b] transition hover:-translate-y-px"
              >
                Use template
              </button>
              <button
                onClick={() => duplicateTemplate(template)}
                className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 text-[0.82rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                Copy
              </button>
              <button
                onClick={() => deleteTemplate(template.id)}
                className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 text-[0.82rem] font-semibold text-[var(--muted-2)] transition hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Create new */}
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-[20px] border border-dashed border-white/15 bg-white/[.015] p-5 text-center transition hover:border-white/25 hover:bg-white/3"
          >
            <div className="mb-2 text-3xl text-[var(--muted-2)]">+</div>
            <div className="text-[0.88rem] font-semibold text-[var(--muted)]">New template</div>
          </button>
        )}

        {creating && (
          <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.04)] p-5">
            <div className="mb-3 font-semibold text-[var(--accent)]">New template</div>
            <div className="grid gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Template name"
                className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description"
                className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
              />
              <p className="text-[0.78rem] text-[var(--muted)]">Create an invoice first, then save it as a template from the invoice actions panel.</p>
              <div className="flex gap-2">
                <button onClick={() => setCreating(false)} className="flex-1 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 text-[0.85rem] font-semibold text-[var(--muted)]">Cancel</button>
                <button onClick={() => { router.push("/app/invoices/new"); }} className="flex-1 rounded-xl bg-[var(--accent)] px-3 py-2.5 text-[0.85rem] font-bold text-[#08100b]">Create invoice</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] font-semibold text-[var(--accent)]">
          {message}
        </div>
      )}
    </div>
  );
}