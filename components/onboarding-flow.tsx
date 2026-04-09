"use client";

import { ArcFaucetGuide } from "@/components/arc-faucet-guide";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { fetchWorkspaceProfile, saveWorkspaceProfile } from "@/lib/supabase-data";
import { toast } from "@/components/toast";

type Step = "welcome" | "workspace" | "wallet" | "client" | "invoice" | "done";

const STEPS: Step[] = ["welcome", "workspace", "wallet", "client", "invoice", "done"];

function stepIndex(s: Step) { return STEPS.indexOf(s); }

function ProgressDots({ current }: { current: Step }) {
  const steps: Step[] = ["workspace", "wallet", "client", "invoice"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const ci = stepIndex(current);
        const si = stepIndex(s);
        return (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              ci > si ? "w-6 bg-[var(--accent)]"
              : ci === si ? "w-6 bg-[var(--accent)] opacity-50"
              : "w-2 bg-white/15"
            }`}
          />
        );
      })}
    </div>
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Workspace fields
  const [workspaceName, setWorkspaceName] = useState("");
  const [roleType, setRoleType] = useState<"Freelancer" | "Agency">("Freelancer");

  // Wallet
  const [walletAddress, setWalletAddress] = useState("");

  // Client
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    // Check if already completed onboarding
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("stablelane_onboarding_done");
      if (done === "true") { router.replace("/app"); return; }
    }
    loadUser();
  }, []);

  async function loadUser() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth"); return; }
    setEmail(user.email || "");

    const profile = await fetchWorkspaceProfile();
    if (profile?.workspace_name && profile.workspace_name !== "Stablelane Workspace") {
      setWorkspaceName(profile.workspace_name);
    }
    if ((profile as any)?.wallet_address) {
      setWalletAddress((profile as any).wallet_address);
    }
    if (profile?.role_type) {
      setRoleType(profile.role_type as "Freelancer" | "Agency");
    }
  }

  async function saveWorkspace() {
    if (!workspaceName.trim()) { toast("Enter a workspace name.", "err"); return; }
    setLoading(true);
    try {
      await saveWorkspaceProfile({
        workspace_name: workspaceName.trim(),
        role_type: roleType,
        default_currency: "USDC",
        wallet_address: walletAddress.trim() || null,
      });
      toast("Workspace saved.");
      setStep("wallet");
    } catch {
      toast("Could not save. Try again.", "err");
    }
    setLoading(false);
  }

  async function saveWallet() {
    setLoading(true);
    try {
      if (walletAddress.trim()) {
        await saveWorkspaceProfile({
          workspace_name: workspaceName.trim() || "My Workspace",
          role_type: roleType,
          default_currency: "USDC",
          wallet_address: walletAddress.trim(),
        });
        toast("Wallet saved.");
      }
      setStep("client");
    } catch {
      toast("Could not save wallet.", "err");
    }
    setLoading(false);
  }

  async function saveClient() {
    setLoading(true);
    try {
      if (clientName.trim()) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          await supabase.from("clients").insert({
            client_name: clientName.trim(),
            client_email: clientEmail.trim(),
          });
          toast("Client saved.");
        }
      }
      setStep("invoice");
    } catch {
      toast("Could not save client.", "err");
    }
    setLoading(false);
  }

  function finish() {
    if (typeof window !== "undefined") {
      localStorage.setItem("stablelane_onboarding_done", "true");
      localStorage.setItem("stablelane_onboarding_dismissed", "true");
    }
    router.push("/app");
  }

  function goInvoice() {
    if (typeof window !== "undefined") {
      localStorage.setItem("stablelane_onboarding_done", "true");
      localStorage.setItem("stablelane_onboarding_dismissed", "true");
      // Prefill client if they added one
      if (clientName) {
        sessionStorage.setItem("stablelane_prefill_client", JSON.stringify({
          clientName,
          clientEmail,
          title: `Invoice for ${clientName}`,
        }));
      }
    }
    router.push("/app/invoices/new");
  }

  // Shared card wrapper
  function Card({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold">
              Stablelane<span className="text-[var(--accent)]">.</span>
            </span>
          </div>
          <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.96),rgba(10,18,13,.92))] p-8 shadow-[0_28px_90px_rgba(0,0,0,.5)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(201,255,96,.08),transparent_70%)]" />
            <div className="relative">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  // WELCOME
  if (step === "welcome") return (
    <Card>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Welcome to Stablelane
      </div>
      <h1 className="mb-3 mt-4 font-[family-name:var(--font-cormorant)] text-[2.8rem] leading-[0.95] tracking-[-0.05em]">
        Your lane is ready,{" "}
        <em className="text-[var(--accent)]">
          {email.split("@")[0] || "friend"}.
        </em>
      </h1>
      <p className="mb-8 text-[0.95rem] leading-7 text-[var(--muted)]">
        Set up your workspace in 4 quick steps. You will be sending your first invoice in under 60 seconds.
      </p>

      <div className="mb-8 grid gap-3">
        {[
          { icon: "▣", label: "Name your workspace", done: false },
          { icon: "◎", label: "Add your Arc wallet", done: false },
          { icon: "◌", label: "Add your first client", done: false },
          { icon: "◈", label: "Create your first invoice", done: false },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
            <span className="text-[var(--accent)] opacity-60">{item.icon}</span>
            <span className="text-[0.88rem] text-[var(--muted)]">{item.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setStep("workspace")}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-[1rem] font-bold text-[#08100b] transition hover:-translate-y-px"
      >
        Get started
      </button>
      <button
        onClick={finish}
        className="mt-3 w-full rounded-2xl border border-white/8 py-3 text-[0.88rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
      >
        Skip setup, go to workspace
      </button>
    </Card>
  );

  // WORKSPACE
  if (step === "workspace") return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Step 1 of 4</span>
        <ProgressDots current={step} />
      </div>
      <h2 className="mb-1 mt-4 font-[family-name:var(--font-cormorant)] text-[2.2rem] tracking-[-0.04em]">
        Name your workspace
      </h2>
      <p className="mb-6 text-[0.88rem] text-[var(--muted)]">
        This appears on invoices and your client portal.
      </p>

      <div className="grid gap-4">
        <div>
          <label className="mb-1.5 block text-[0.8rem] font-semibold text-[var(--muted)]">Workspace name</label>
          <input
            autoFocus
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveWorkspace()}
            placeholder="e.g. Studio Mia, Acme Agency"
            className="w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-3.5 text-[0.95rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[0.8rem] font-semibold text-[var(--muted)]">I work as a</label>
          <div className="grid grid-cols-2 gap-3">
            {(["Freelancer", "Agency"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleType(r)}
                className={`rounded-2xl border py-3.5 text-[0.92rem] font-bold transition ${
                  roleType === r
                    ? "border-[var(--accent)] bg-[rgba(201,255,96,.12)] text-[var(--accent)]"
                    : "border-white/8 bg-white/3 text-[var(--muted)] hover:bg-white/5"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => setStep("welcome")} className="rounded-2xl border border-white/8 bg-white/3 px-5 py-3.5 text-[0.88rem] font-semibold text-[var(--muted)]">
          Back
        </button>
        <button
          onClick={saveWorkspace}
          disabled={loading || !workspaceName.trim()}
          className="flex-1 rounded-2xl bg-[var(--accent)] py-3.5 text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </Card>
  );

  // WALLET
  if (step === "wallet") return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Step 2 of 4</span>
        <ProgressDots current={step} />
      </div>
      <h2 className="mb-1 mt-4 font-[family-name:var(--font-cormorant)] text-[2.2rem] tracking-[-0.04em]">
        Add your Arc wallet
      </h2>
      <p className="mb-2 text-[0.88rem] text-[var(--muted)]">
        This wallet receives USDC when clients approve milestones on Arc testnet.
      </p>

      <ArcFaucetGuide walletAddress={walletAddress || undefined} />

      <div className="grid gap-4">
        <div>
          <label className="mb-1.5 block text-[0.8rem] font-semibold text-[var(--muted)]">Wallet address (Arc testnet)</label>
          <input
            autoFocus
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-3.5 font-mono text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
          />
          <p className="mt-1.5 text-[0.75rem] text-[var(--muted)]">You can add this later in Settings if you do not have it now.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => setStep("workspace")} className="rounded-2xl border border-white/8 bg-white/3 px-5 py-3.5 text-[0.88rem] font-semibold text-[var(--muted)]">
          Back
        </button>
        <button
          onClick={saveWallet}
          disabled={loading}
          className="flex-1 rounded-2xl bg-[var(--accent)] py-3.5 text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-50"
        >
          {loading ? "Saving..." : walletAddress.trim() ? "Save and continue" : "Skip for now"}
        </button>
      </div>
    </Card>
  );

  // CLIENT
  if (step === "client") return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Step 3 of 4</span>
        <ProgressDots current={step} />
      </div>
      <h2 className="mb-1 mt-4 font-[family-name:var(--font-cormorant)] text-[2.2rem] tracking-[-0.04em]">
        Add your first client
      </h2>
      <p className="mb-6 text-[0.88rem] text-[var(--muted)]">
        Save a client record once, reuse it across all invoices. You can add more later.
      </p>

      <div className="grid gap-4">
        <div>
          <label className="mb-1.5 block text-[0.8rem] font-semibold text-[var(--muted)]">Client or company name</label>
          <input
            autoFocus
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-3.5 text-[0.95rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[0.8rem] font-semibold text-[var(--muted)]">Client email</label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@company.com"
            className="w-full rounded-2xl border border-white/8 bg-white/3 px-4 py-3.5 text-[0.95rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
          />
          <p className="mt-1.5 text-[0.75rem] text-[var(--muted)]">Used for payment reminders and their client portal.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => setStep("wallet")} className="rounded-2xl border border-white/8 bg-white/3 px-5 py-3.5 text-[0.88rem] font-semibold text-[var(--muted)]">
          Back
        </button>
        <button
          onClick={saveClient}
          disabled={loading}
          className="flex-1 rounded-2xl bg-[var(--accent)] py-3.5 text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-50"
        >
          {loading ? "Saving..." : clientName.trim() ? "Save and continue" : "Skip for now"}
        </button>
      </div>
    </Card>
  );

  // INVOICE PROMPT
  if (step === "invoice") return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Step 4 of 4</span>
        <ProgressDots current={step} />
      </div>
      <h2 className="mb-1 mt-4 font-[family-name:var(--font-cormorant)] text-[2.2rem] tracking-[-0.04em]">
        Create your first invoice
      </h2>
      <p className="mb-6 text-[0.88rem] text-[var(--muted)]">
        Build an invoice with milestones, copy the payment link, and send it to your client. They fund the escrow before work starts.
      </p>

      <div className="mb-6 grid gap-3">
        {[
          { icon: "▣", title: "Set amount and milestones", detail: "Break the project into deliverable stages." },
          { icon: "◈", title: "Copy the payment link", detail: "One URL your client uses to fund escrow." },
          { icon: "◎", title: "Client locks USDC", detail: "Funds sit in escrow until you approve." },
          { icon: "◌", title: "Approve and get paid", detail: "Release milestones on-chain. Settles in under 1 second." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
            <span className="mt-0.5 text-[var(--accent)]">{item.icon}</span>
            <div>
              <div className="text-[0.86rem] font-semibold">{item.title}</div>
              <div className="text-[0.76rem] text-[var(--muted)]">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goInvoice}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-[1rem] font-bold text-[#08100b] transition hover:-translate-y-px"
      >
        Create my first invoice
      </button>
      <button
        onClick={finish}
        className="mt-3 w-full rounded-2xl border border-white/8 py-3 text-[0.88rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
      >
        Go to workspace first
      </button>
    </Card>
  );

  return null;
}