"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { LoadingState, InlineNotice } from "@/components/ui-state";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function shortAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function toHexChainId(id: number) {
  return `0x${id.toString(16)}`;
}

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function WalletConnectPanel() {
  const [checking, setChecking] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const { ready, network, environment } = useAppEnvironment();
  const installed = Boolean(getEthereumProvider());
  const onExpectedNetwork = chainId === network.chainId;

  useEffect(() => {
    let mounted = true;

    async function syncWallet() {
      const provider = getEthereumProvider();
      if (!provider) {
        if (mounted) setChecking(false);
        return;
      }

      try {
        const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
        const currentChain = (await provider.request({ method: "eth_chainId" })) as string;
        if (!mounted) return;
        setWalletAddress(accounts?.[0] || "");
        setChainId(currentChain ? parseInt(currentChain, 16) : null);
      } catch {
        if (mounted) setMessage("Wallet status could not be read right now.");
      } finally {
        if (mounted) setChecking(false);
      }
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = (args[0] as string[]) || [];
      setWalletAddress(accounts[0] || "");
    };
    const handleChainChanged = (value: unknown) => {
      const parsed = typeof value === "string" ? parseInt(value, 16) : null;
      setChainId(parsed);
    };

    syncWallet();

    getEthereumProvider()?.on?.("accountsChanged", handleAccountsChanged);
    getEthereumProvider()?.on?.("chainChanged", handleChainChanged);

    return () => {
      mounted = false;
      getEthereumProvider()?.removeListener?.("accountsChanged", handleAccountsChanged);
      getEthereumProvider()?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  async function connectWallet() {
    const provider = getEthereumProvider();
    if (!provider) return;
    setBusy(true);
    setMessage("");
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      setWalletAddress(accounts?.[0] || "");
      const currentChain = (await provider.request({ method: "eth_chainId" })) as string;
      setChainId(currentChain ? parseInt(currentChain, 16) : null);
      setMessage("Wallet connected.");
    } catch {
      setMessage("Wallet connection was cancelled or failed.");
    } finally {
      setBusy(false);
    }
  }

  async function switchNetwork() {
    const provider = getEthereumProvider();
    if (!provider) return;
    setBusy(true);
    setMessage("");
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHexChainId(network.chainId) }],
      });
      setChainId(network.chainId);
      setMessage("Selected environment is now active in your wallet.");
    } catch {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: toHexChainId(network.chainId),
              chainName: "Arc Testnet",
              nativeCurrency: {
                name: network.gasToken,
                symbol: network.gasToken,
                decimals: 6,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl],
            },
          ],
        });
        setChainId(network.chainId);
        setMessage("Selected environment was added to your wallet.");
      } catch {
        setMessage("Network switch failed. You can still keep testing the app screens.");
      }
    } finally {
      setBusy(false);
    }
  }

  const statusTitle = useMemo(() => {
    if (!installed) return "Wallet not detected";
    if (!walletAddress) return "Connect wallet when needed";
    if (!onExpectedNetwork) return "Wrong network";
    return "Wallet ready";
  }, [installed, walletAddress, onExpectedNetwork]);

  if (checking || !ready) {
    return (
      <LoadingState
        title="Checking wallet state"
        detail="Stablelane is looking for an injected wallet and the current network."
      />
    );
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.88),rgba(10,18,13,.84))] p-5 shadow-[0_18px_60px_rgba(0,0,0,.2)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
            Optional wallet and environment
          </div>
          <h2 className="text-base font-bold tracking-normal">{statusTitle}</h2>
          <p className="mt-1 max-w-xl text-[0.84rem] leading-6 text-[var(--muted)]">
            Wallet connection is optional. Use it only when you need Arc funding, Gateway, escrow, or release actions. You can stay signed in with email first and connect wallet later.
          </p>
        </div>
        <div className={`rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${
          onExpectedNetwork && walletAddress
            ? "bg-[rgba(201,255,96,.11)] text-[var(--accent)]"
            : "bg-white/8 text-[var(--muted)]"
        }`}>
          {onExpectedNetwork && walletAddress ? "Ready" : network.mode === "preview" ? "Preview mode" : "Check required"}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Wallet</div>
          <div className="font-semibold text-[var(--text)]">
            {walletAddress ? shortAddress(walletAddress) : installed ? "Optional for now" : "No wallet found"}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Chain</div>
          <div className="font-semibold text-[var(--text)]">
            {chainId ? chainId : network.mode === "preview" ? "Preview only" : "Unknown"}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Explorer</div>
          <Link href={network.explorerUrl || siteConfig.arc.explorerUrl} target="_blank" className="font-semibold text-[var(--accent)]">
            Open explorer
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {installed && !walletAddress ? (
          <button
            type="button"
            disabled={busy}
            onClick={connectWallet}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {busy ? "Connecting..." : "Connect wallet"}
          </button>
        ) : null}

        {installed && walletAddress && !onExpectedNetwork && network.hasCompleteConfig ? (
          <button
            type="button"
            disabled={busy}
            onClick={switchNetwork}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {busy ? "Switching..." : "Switch to selected network"}
          </button>
        ) : null}

        {!installed ? (
          <Link
            href="https://metamask.io/download/"
            target="_blank"
            className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]"
          >
            Install a wallet
          </Link>
        ) : null}

        <Link
          href="/app/settings"
          className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]"
        >
          Open settings
        </Link>
      </div>

      {environment === "mainnet" && !network.hasCompleteConfig ? (
        <div className="mt-4">
          <InlineNotice
            title="Mainnet is in guarded mode"
            detail="This mode is available in the UI, but write actions stay limited until the mainnet RPC, chain ID, and explorer values are fully configured."
            tone="warning"
          />
        </div>
      ) : null}

      {message ? (
        <div className="mt-4">
          <InlineNotice
            title="Wallet status"
            detail={message}
            tone={onExpectedNetwork && walletAddress ? "success" : "neutral"}
          />
        </div>
      ) : null}
    </section>
  );
}
