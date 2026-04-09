"use client";

import { ArcFaucetGuide } from "@/components/arc-faucet-guide";

import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http, parseUnits, createWalletClient, custom } from "viem";
import { arcTestnet, USDC_ADDRESS } from "@/lib/escrow-client";
import { USDC_ABI } from "@/lib/escrow-abi";

type WalletEntry = {
  address: string;
  label: string;
  balance: string;
  addedAt: string;
};

type TxRecord = {
  hash: string;
  to: string;
  amount: string;
  timestamp: string;
};

const ARC_EXPLORER = "https://testnet.arcscan.app";
const FAUCET_URL = "https://faucet.circle.com";
const STORAGE_KEY = "stablelane_treasury_wallets";
const TX_STORAGE_KEY = "stablelane_treasury_txs";

function getPublicClient() {
  return createPublicClient({ chain: arcTestnet, transport: http("https://rpc.testnet.arc.network") });
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function loadWallets(): WalletEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveWallets(wallets: WalletEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
}

function loadTxs(): TxRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(TX_STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveTxs(txs: TxRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(txs));
}

export function TreasuryConsole() {
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [connectedBalance, setConnectedBalance] = useState<string>("—");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"ok" | "err">("ok");
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [tab, setTab] = useState<"wallets" | "transfer" | "history" | "faucet">("wallets");

  useEffect(() => {
    setWallets(loadWallets());
    setTxs(loadTxs());
    detectConnected();
  }, []);

  async function detectConnected() {
    const win = window as Window & { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } };
    if (!win.ethereum) return;
    try {
      const accounts = await win.ethereum.request({ method: "eth_accounts" }) as string[];
      if (accounts[0]) {
        setConnectedAddress(accounts[0]);
        fetchBalance(accounts[0]).then(setConnectedBalance);
      }
    } catch {}
  }

  async function connectWallet() {
    const win = window as Window & { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } };
    if (!win.ethereum) { showMsg("No wallet detected. Install MetaMask or Rabby.", "err"); return; }
    setLoading(true);
    try {
      await win.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${arcTestnet.id.toString(16)}`,
          chainName: "Arc Testnet",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
          rpcUrls: ["https://rpc.testnet.arc.network"],
          blockExplorerUrls: ["https://testnet.arcscan.app"],
        }],
      });
      const accounts = await win.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      if (accounts[0]) {
        setConnectedAddress(accounts[0]);
        const bal = await fetchBalance(accounts[0]);
        setConnectedBalance(bal);
        showMsg("Wallet connected to Arc testnet.", "ok");
      }
    } catch (e) {
      showMsg("Wallet connection failed.", "err");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBalance(address: string): Promise<string> {
    try {
      const client = getPublicClient();
      const raw = await client.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      }) as bigint;
      return (Number(raw) / 1_000_000).toFixed(2);
    } catch { return "0.00"; }
  }

  const refreshBalances = useCallback(async () => {
    const updated = await Promise.all(
      wallets.map(async (w) => ({ ...w, balance: await fetchBalance(w.address) }))
    );
    setWallets(updated);
    saveWallets(updated);
    if (connectedAddress) {
      fetchBalance(connectedAddress).then(setConnectedBalance);
    }
    showMsg("Balances refreshed.", "ok");
  }, [wallets, connectedAddress]);

  function addWallet() {
    if (!newAddress.startsWith("0x") || newAddress.length !== 42) {
      showMsg("Enter a valid 0x wallet address.", "err"); return;
    }
    const entry: WalletEntry = {
      address: newAddress.toLowerCase(),
      label: newLabel || `Wallet ${wallets.length + 1}`,
      balance: "—",
      addedAt: new Date().toISOString(),
    };
    const updated = [entry, ...wallets];
    setWallets(updated);
    saveWallets(updated);
    setNewAddress("");
    setNewLabel("");
    fetchBalance(newAddress).then((bal) => {
      const refreshed = updated.map((w) => w.address === entry.address ? { ...w, balance: bal } : w);
      setWallets(refreshed);
      saveWallets(refreshed);
    });
    showMsg("Wallet added.", "ok");
  }

  function removeWallet(address: string) {
    const updated = wallets.filter((w) => w.address !== address);
    setWallets(updated);
    saveWallets(updated);
  }

  function exportCSV() {
    const rows = [["Label", "Address", "Balance USDC", "Added"]];
    wallets.forEach((w) => rows.push([w.label, w.address, w.balance, w.addedAt]));
    if (connectedAddress) rows.unshift(["Connected wallet", connectedAddress, connectedBalance, ""]);
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "stablelane-wallets.csv"; a.click();
    URL.revokeObjectURL(url);
    showMsg("Wallet list exported.", "ok");
  }

  async function sendUSDC() {
    if (!connectedAddress) { showMsg("Connect your wallet first.", "err"); return; }
    if (!transferTo.startsWith("0x") || transferTo.length !== 42) { showMsg("Enter a valid recipient address.", "err"); return; }
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) { showMsg("Enter a valid amount.", "err"); return; }

    setLoading(true);
    showMsg("Sending USDC on Arc testnet...", "ok");

    try {
      const win = window as Window & { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } };
      if (!win.ethereum) throw new Error("No wallet");
      const wallet = createWalletClient({ chain: arcTestnet, transport: custom(win.ethereum) });
      const [account] = await wallet.getAddresses();
      const client = getPublicClient();

      const hash = await wallet.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [transferTo as `0x${string}`, parseUnits(amount.toString(), 6)],
        account,
      });

      await client.waitForTransactionReceipt({ hash });

      const tx: TxRecord = {
        hash,
        to: transferTo,
        amount: amount.toFixed(2),
        timestamp: new Date().toISOString(),
      };
      const updatedTxs = [tx, ...txs];
      setTxs(updatedTxs);
      saveTxs(updatedTxs);

      setTransferTo("");
      setTransferAmount("");
      showMsg(`Sent ${amount} USDC. Tx: ${hash.slice(0, 10)}...`, "ok");

      fetchBalance(connectedAddress).then(setConnectedBalance);
    } catch (e) {
      showMsg(e instanceof Error ? e.message : "Transfer failed.", "err");
    } finally {
      setLoading(false);
    }
  }

  function showMsg(text: string, type: "ok" | "err") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    showMsg(`${label} copied.`, "ok");
  }

  const tabClass = (t: typeof tab) =>
    `px-4 py-2 rounded-xl text-[0.85rem] font-semibold transition ${
      tab === t
        ? "bg-[var(--accent)] text-[#08100b]"
        : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]"
    }`;

  return (
    <div className="grid gap-4">

      {/* Connected wallet card */}
      <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.05)] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Connected wallet</div>
            {connectedAddress ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.92rem] text-[var(--text)]">{shortAddr(connectedAddress)}</span>
                <span className="font-[family-name:var(--font-cormorant)] text-[1.6rem] tracking-[-0.04em] text-[var(--accent)]">{connectedBalance} USDC</span>
              </div>
            ) : (
              <p className="text-[0.88rem] text-[var(--muted)]">No wallet connected. Connect to view balance and send USDC.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedAddress ? (
              <>
                <button onClick={() => copyToClipboard(connectedAddress, "Address")} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] transition hover:bg-white/5">Copy address</button>
                <a href={`${ARC_EXPLORER}/address/${connectedAddress}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--accent)] transition hover:bg-white/5">Explorer ↗</a>
                <button onClick={refreshBalances} disabled={loading} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] transition hover:bg-white/5">Refresh</button>
              </>
            ) : (
              <button onClick={connectWallet} disabled={loading} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-[0.88rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-70">
                {loading ? "Connecting..." : "Connect wallet"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 rounded-[16px] border border-white/8 bg-white/3 p-2">
        <button className={tabClass("wallets")} onClick={() => setTab("wallets")}>Wallets</button>
        <button className={tabClass("transfer")} onClick={() => setTab("transfer")}>Transfer USDC</button>
        <button className={tabClass("history")} onClick={() => setTab("history")}>History</button>
        <button className={tabClass("faucet")} onClick={() => setTab("faucet")}>Faucet</button>
      </div>

      {/* Wallets tab */}
      {tab === "wallets" && (
        <div className="grid gap-4">
          {/* Add wallet */}
          <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
            <h2 className="mb-3 text-base font-bold">Track a wallet</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x wallet address"
                className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 font-mono text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
              />
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (optional)"
                className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
              />
              <button onClick={addWallet} className="rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.88rem] font-bold text-[#08100b] transition hover:-translate-y-px">
                Add
              </button>
            </div>
          </div>

          {/* Wallet list */}
          {wallets.length > 0 && (
            <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">Tracked wallets ({wallets.length})</h2>
                <button onClick={exportCSV} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] transition hover:bg-white/5">
                  Export CSV
                </button>
              </div>
              <div className="grid gap-2">
                {wallets.map((w) => (
                  <div key={w.address} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                    <div>
                      <div className="text-[0.88rem] font-semibold">{w.label}</div>
                      <div className="font-mono text-[0.78rem] text-[var(--muted)]">{shortAddr(w.address)}</div>
                    </div>
                    <div className="font-semibold text-[var(--accent)]">{w.balance} USDC</div>
                    <div className="flex gap-2">
                      <button onClick={() => copyToClipboard(w.address, "Address")} className="rounded-lg border border-white/8 bg-white/3 px-2 py-1.5 text-[0.75rem] text-[var(--muted)] transition hover:text-[var(--text)]">Copy</button>
                      <a href={`${ARC_EXPLORER}/address/${w.address}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/8 bg-white/3 px-2 py-1.5 text-[0.75rem] text-[var(--accent)] transition hover:bg-white/5">↗</a>
                      <button onClick={() => removeWallet(w.address)} className="rounded-lg border border-white/8 bg-white/3 px-2 py-1.5 text-[0.75rem] text-[var(--muted-2)] transition hover:text-red-400">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wallets.length === 0 && (
            <div className="rounded-[20px] border border-white/8 bg-white/3 p-8 text-center">
              <div className="mb-2 text-3xl opacity-20">◈</div>
              <p className="text-[0.88rem] text-[var(--muted)]">No wallets tracked yet. Add an address to watch its USDC balance.</p>
            </div>
          )}
        </div>
      )}

      {/* Transfer tab */}
      {tab === "transfer" && (
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold">Send USDC on Arc</h2>
          <p className="mb-4 text-[0.84rem] text-[var(--muted)]">Transfer USDC directly from your connected wallet to any address on Arc testnet.</p>
          {!connectedAddress ? (
            <button onClick={connectWallet} className="rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.88rem] font-bold text-[#08100b]">
              Connect wallet first
            </button>
          ) : (
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Recipient address</label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 font-mono text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Amount (USDC)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <span className="text-[0.82rem] text-[var(--muted)]">Your balance</span>
                <span className="font-semibold text-[var(--accent)]">{connectedBalance} USDC</span>
              </div>
              <button
                onClick={sendUSDC}
                disabled={loading}
                className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-70"
              >
                {loading ? "Sending..." : `Send ${transferAmount || "0"} USDC`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold">Transaction history</h2>
          <p className="mb-4 text-[0.84rem] text-[var(--muted)]">USDC transfers sent from this workspace session.</p>
          {txs.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-3xl opacity-20">◌</div>
              <p className="text-[0.88rem] text-[var(--muted)]">No transactions yet. Send USDC from the Transfer tab.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {txs.map((tx) => (
                <div key={tx.hash} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                  <div>
                    <div className="text-[0.86rem] font-semibold">{tx.amount} USDC → {shortAddr(tx.to)}</div>
                    <div className="text-[0.75rem] text-[var(--muted)]">{new Date(tx.timestamp).toLocaleString()}</div>
                  </div>
                  <a
                    href={`${ARC_EXPLORER}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--accent)]"
                  >
                    View ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Faucet tab */}
      {tab === "faucet" && (
        <ArcFaucetGuide walletAddress={connectedAddress || undefined} />
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-2xl px-4 py-3 text-[0.84rem] font-semibold ${
          messageType === "ok"
            ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
            : "border border-white/8 bg-white/3 text-red-400"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}