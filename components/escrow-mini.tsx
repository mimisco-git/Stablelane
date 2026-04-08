"use client";

import { useState } from "react";
import { createWalletClient, createPublicClient, http, parseUnits, custom } from "viem";
import { arcTestnet, USDC_ADDRESS, FACTORY_ADDRESS, ROUTER_ADDRESS } from "@/lib/escrow-client";
import { FACTORY_ABI, USDC_ABI, ESCROW_ABI } from "@/lib/escrow-abi";

type EscrowRecord = {
  id: string;
  label: string;
  amount: string;
  recipient: string;
  escrowAddress: string;
  createTx: string;
  status: "funded" | "pending_release" | "released";
  releaseTx?: string;
  createdAt: string;
};

const STORAGE_KEY = "stablelane_escrow_mini";

function loadRecords(): EscrowRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveRecords(records: EscrowRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function shortAddr(a: string) { return `${a.slice(0, 8)}...${a.slice(-6)}`; }
function shortHash(h: string) { return `${h.slice(0, 10)}...`; }

function getPublicClient() {
  return createPublicClient({ chain: arcTestnet, transport: http("https://rpc.testnet.arc.network") });
}

export function EscrowMini() {
  const [records, setRecords] = useState<EscrowRecord[]>(loadRecords);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");
  const [tab, setTab] = useState<"create" | "dashboard">("create");

  function showMsg(text: string, type: "ok" | "err" = "ok") {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 5000);
  }

  async function getWallet() {
    const win = window as Window & { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } };
    if (!win.ethereum) throw new Error("No wallet detected.");
    const walletClient = createWalletClient({ chain: arcTestnet, transport: custom(win.ethereum) });
    const [account] = await walletClient.getAddresses();
    if (!account) {
      await win.ethereum.request({ method: "eth_requestAccounts" });
      const [acc] = await walletClient.getAddresses();
      return { walletClient, account: acc };
    }
    return { walletClient, account };
  }

  async function createEscrow() {
    if (!recipient.startsWith("0x") || recipient.length !== 42) { showMsg("Enter a valid recipient address.", "err"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showMsg("Enter a valid USDC amount.", "err"); return; }
    if (!FACTORY_ADDRESS) { showMsg("Escrow factory not configured.", "err"); return; }

    setLoading(true);
    showMsg("Approving USDC and creating escrow on Arc...");

    try {
      const { walletClient, account } = await getWallet();
      const client = getPublicClient();
      const amountUnits = parseUnits(amt.toString(), 6);
      const invoiceId = `mini_${Date.now()}`;

      // Approve
      const approveTx = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [FACTORY_ADDRESS, amountUnits],
        account,
      });
      await client.waitForTransactionReceipt({ hash: approveTx });

      // Create escrow
      const createTx = await walletClient.writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createEscrow",
        args: [
          USDC_ADDRESS,
          recipient as `0x${string}`,
          "0x0000000000000000000000000000000000000000" as `0x${string}`,
          amountUnits,
          BigInt(7),
          invoiceId,
          ["Full payment"],
          [amountUnits],
        ],
        account,
      });
      await client.waitForTransactionReceipt({ hash: createTx });

      const escrowAddress = await client.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "getEscrowByInvoice",
        args: [invoiceId],
      }) as string;

      // Fund it
      const fundTx = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [escrowAddress as `0x${string}`, amountUnits],
        account,
      });
      await client.waitForTransactionReceipt({ hash: fundTx });

      const fund2Tx = await walletClient.writeContract({
        address: escrowAddress as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: "fund",
        args: [],
        account,
      });
      await client.waitForTransactionReceipt({ hash: fund2Tx });

      const record: EscrowRecord = {
        id: invoiceId,
        label: label || `Escrow ${records.length + 1}`,
        amount: amt.toFixed(2),
        recipient,
        escrowAddress,
        createTx,
        status: "funded",
        createdAt: new Date().toISOString(),
      };
      const updated = [record, ...records];
      setRecords(updated);
      saveRecords(updated);
      setRecipient(""); setAmount(""); setLabel("");
      setTab("dashboard");
      showMsg(`Escrow funded with ${amt} USDC on Arc testnet.`);
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Failed.", "err");
    } finally {
      setLoading(false);
    }
  }

  async function releaseEscrow(record: EscrowRecord) {
    setLoading(true);
    showMsg("Releasing funds on Arc testnet...");
    try {
      const { walletClient, account } = await getWallet();
      const client = getPublicClient();

      const tx = await walletClient.writeContract({
        address: record.escrowAddress as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: "approveMilestone",
        args: [BigInt(0)],
        account,
      });
      await client.waitForTransactionReceipt({ hash: tx });

      const updated = records.map((r) =>
        r.id === record.id ? { ...r, status: "released" as const, releaseTx: tx } : r
      );
      setRecords(updated);
      saveRecords(updated);
      showMsg("Funds released to recipient.");
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Release failed.", "err");
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (s: EscrowRecord["status"]) => {
    if (s === "funded") return "bg-[rgba(201,255,96,.12)] text-[var(--accent)]";
    if (s === "pending_release") return "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]";
    return "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]";
  };

  const statusLabel = (s: EscrowRecord["status"]) => {
    if (s === "funded") return "Funded";
    if (s === "pending_release") return "Pending release";
    return "Released";
  };

  const counts = {
    funded: records.filter((r) => r.status === "funded").length,
    pending: records.filter((r) => r.status === "pending_release").length,
    released: records.filter((r) => r.status === "released").length,
  };

  const tabClass = (t: typeof tab) =>
    `px-4 py-2 rounded-xl text-[0.85rem] font-semibold transition ${
      tab === t ? "bg-[var(--accent)] text-[#08100b]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]"
    }`;

  return (
    <div className="grid gap-4">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Funded", value: counts.funded, tone: "text-[var(--accent)]" },
          { label: "Pending release", value: counts.pending, tone: "text-[var(--accent-3)]" },
          { label: "Released", value: counts.released, tone: "text-[var(--accent-2)]" },
        ].map((s) => (
          <div key={s.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4 text-center">
            <div className={`font-[family-name:var(--font-cormorant)] text-[2.2rem] tracking-[-0.05em] ${s.tone}`}>{s.value}</div>
            <div className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-[16px] border border-white/8 bg-white/3 p-2">
        <button className={tabClass("create")} onClick={() => setTab("create")}>New escrow</button>
        <button className={tabClass("dashboard")} onClick={() => setTab("dashboard")}>Dashboard ({records.length})</button>
      </div>

      {tab === "create" && (
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold">Create instant escrow</h2>
          <p className="mb-4 text-[0.84rem] text-[var(--muted)]">Lock USDC on Arc testnet. You control release. No invoice needed.</p>
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Label (optional)</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Design deposit" className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Recipient wallet (receives USDC on release)</label>
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 font-mono text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Amount (USDC)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]" />
            </div>
            <button onClick={createEscrow} disabled={loading} className="w-full rounded-xl bg-[var(--accent)] px-4 py-3.5 text-[0.92rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-70">
              {loading ? "Working on Arc..." : "Fund escrow on Arc"}
            </button>
          </div>
        </div>
      )}

      {tab === "dashboard" && (
        <div className="grid gap-3">
          {records.length === 0 ? (
            <div className="rounded-[20px] border border-white/8 bg-white/3 p-10 text-center">
              <div className="mb-2 text-3xl opacity-20">◈</div>
              <p className="mb-3 text-[0.88rem] text-[var(--muted)]">No escrows yet. Create your first one above.</p>
              <button onClick={() => setTab("create")} className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.85rem] font-bold text-[#08100b]">Create escrow</button>
            </div>
          ) : (
            records.map((r) => (
              <div key={r.id} className="rounded-[20px] border border-white/8 bg-white/3 p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 font-semibold">{r.label}</div>
                    <div className="font-[family-name:var(--font-cormorant)] text-[1.6rem] tracking-[-0.04em] text-[var(--accent)]">{r.amount} USDC</div>
                    <div className="text-[0.78rem] text-[var(--muted)]">→ {shortAddr(r.recipient)}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${statusColor(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </div>
                <div className="mb-3 grid gap-2 rounded-xl border border-white/8 bg-white/3 p-3 text-[0.78rem] text-[var(--muted)]">
                  <div className="flex justify-between"><span>Escrow</span><a href={`https://testnet.arcscan.app/address/${r.escrowAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[var(--accent)]">{shortAddr(r.escrowAddress)} ↗</a></div>
                  <div className="flex justify-between"><span>Created</span><span>{new Date(r.createdAt).toLocaleDateString()}</span></div>
                  {r.releaseTx && <div className="flex justify-between"><span>Release tx</span><a href={`https://testnet.arcscan.app/tx/${r.releaseTx}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[var(--accent)]">{shortHash(r.releaseTx)} ↗</a></div>}
                </div>
                {r.status === "funded" && (
                  <button onClick={() => releaseEscrow(r)} disabled={loading} className="w-full rounded-xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.88rem] font-bold text-[var(--accent)] transition hover:bg-[rgba(201,255,96,.12)] disabled:opacity-50">
                    {loading ? "Releasing..." : "Release to recipient"}
                  </button>
                )}
                {r.status === "released" && (
                  <div className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-center text-[0.85rem] text-[var(--muted)]">
                    Funds released on Arc testnet
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {message && (
        <div className={`rounded-2xl px-4 py-3 text-[0.84rem] font-semibold ${
          msgType === "ok"
            ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
            : "border border-white/8 bg-white/3 text-red-400"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}