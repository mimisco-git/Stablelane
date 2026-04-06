"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getBaseUrl } from "@/lib/url";
import { buildWalletAuthMessage } from "@/lib/wallet-auth";
import {
  getSocialProviderOptions,
  getWalletProviderOptions,
  type SocialProviderKey,
} from "@/lib/auth-options";
import {
  readPreviewAccessEnabled,
  readVerifiedWallet,
  readWalletHint,
  shortWallet,
  writeAccessMode,
  writePreviewAccessEnabled,
  writeVerifiedWallet,
  writeWalletHint,
} from "@/lib/access-flow";
import {
  sanitizeNextPath,
  writePendingAuthMethod,
  writePostAuthNextPath,
} from "@/lib/auth-intent";
import { saveLinkedAuthMethod } from "@/lib/supabase-data";

type AuthMode = "signin" | "signup";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

/* ── icon helpers ──────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M9.294 6.928 14.818 0h-1.309L8.7 6.031 4.548 0H0l5.8 8.445L0 15.169h1.309l5.072-5.9 4.053 5.9H16L9.294 6.928ZM7.01 8.521l-.588-.84-4.676-6.69h2.014l3.775 5.4.588.84 4.906 7.016H10.83L7.01 8.521Z"/>
    </svg>
  );
}

function MetaMaskIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
      <path d="M18.7 0 11.04 5.8l1.44-3.42L18.7 0Z" fill="#E17726"/>
      <path d="M1.3 0l7.6 5.86L7.52 2.38 1.3 0Z" fill="#E27625"/>
      <path d="M16.02 12.84l-2.04 3.12 4.36 1.2 1.25-4.25-3.57-.07ZM.43 12.91l1.24 4.25 4.35-1.2-2.04-3.12-3.55.07Z" fill="#E27625"/>
      <path d="M5.8 7.82 4.6 9.64l4.31.2-.15-4.63L5.8 7.82ZM14.2 7.82l-3-2.67-.1 4.69 4.31-.2-1.21-1.82Z" fill="#E27625"/>
      <path d="M6.02 15.96l2.58-1.24-2.22-1.73-.36 2.97ZM11.4 14.72l2.58 1.24-.36-2.97-2.22 1.73Z" fill="#E27625"/>
    </svg>
  );
}

function WalletIcon({ label }: { label: string }) {
  if (label.toLowerCase().includes("meta")) return <MetaMaskIcon />;
  if (label.toLowerCase().includes("coin")) {
    return (
      <span style={{ display: "flex", width: 20, height: 20, borderRadius: "50%", background: "#0052FF", alignItems: "center", justifyContent: "center" }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><circle cx="5" cy="5" r="4" fill="white"/><circle cx="5" cy="5" r="2" fill="#0052FF"/></svg>
      </span>
    );
  }
  return (
    <span style={{ display: "flex", width: 20, height: 20, borderRadius: "50%", background: "#3B99FC", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>W</span>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── main component ────────────────────────────────────────────── */

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const socialProviders = useMemo(() => getSocialProviderOptions().filter((item) => item.enabled), []);
  const walletProviders = useMemo(() => getWalletProviderOptions(), []);

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [walletHint, setWalletHint] = useState("");
  const [verifiedWallet, setVerifiedWallet] = useState("");
  const [activeEmail, setActiveEmail] = useState("");
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const nextPath = sanitizeNextPath(searchParams.get("next") || "/app");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setWalletHint(readWalletHint());
      setVerifiedWallet(readVerifiedWallet());
      writePostAuthNextPath(nextPath);

      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setActiveEmail(data.session?.user?.email || "");

      try {
        const response = await fetch("/api/wallet-auth/session");
        const json = await response.json();
        if (mounted && json?.verified && json?.address) {
          setVerifiedWallet(json.address);
          writeVerifiedWallet(json.address);
        }
      } catch {}
    }

    load();

    if (!supabase) return () => { mounted = false; };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setActiveEmail(session?.user?.email || "");
      setWalletHint(readWalletHint());
      setVerifiedWallet(readVerifiedWallet());
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [nextPath, supabase]);

  function showMessage(text: string, type: "success" | "error" = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function handlePasswordSubmit() {
    if (!supabase) { showMessage("Authentication is not configured. Add your Supabase environment variables.", "error"); return; }
    if (!email || !password) { showMessage("Please enter your email and password.", "error"); return; }

    setLoading("password");
    setMessage("");
    writePendingAuthMethod("email_password");
    writePostAuthNextPath(nextPath);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${getBaseUrl()}/auth/callback` } });
        if (error) throw error;
        writeAccessMode("email");
        writePreviewAccessEnabled(false);
        showMessage("Account created. Check your inbox to confirm, then sign in.", "success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        writeAccessMode("email");
        writePreviewAccessEnabled(false);
        try { await saveLinkedAuthMethod("email_password"); } catch {}
        showMessage("Signed in. Taking you to your workspace...", "success");
        setTimeout(() => router.push(nextPath), 700);
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Authentication failed.", "error");
    } finally {
      setLoading("");
    }
  }

  async function handleMagicLink() {
    if (!supabase) { showMessage("Authentication is not configured. Add your Supabase environment variables.", "error"); return; }
    if (!email) { showMessage("Enter your email address first.", "error"); return; }

    setLoading("magic");
    setMessage("");
    writePendingAuthMethod("email_magic_link");
    writePostAuthNextPath(nextPath);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${getBaseUrl()}/auth/callback` } });
      if (error) throw error;
      writeAccessMode("email");
      writePreviewAccessEnabled(false);
      showMessage("Magic link sent. Check your inbox and click the link to continue.", "success");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Could not send magic link.", "error");
    } finally {
      setLoading("");
    }
  }

  async function handleOAuth(provider: SocialProviderKey) {
    if (!supabase) { showMessage("Authentication is not configured.", "error"); return; }

    setLoading(provider);
    setMessage("");
    writePendingAuthMethod(provider === "google" ? "google_oauth" : "x_oauth");
    writePostAuthNextPath(nextPath);

    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${getBaseUrl()}/auth/callback` } });
      if (error) throw error;
      writeAccessMode("email");
      writePreviewAccessEnabled(false);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "OAuth sign-in failed.", "error");
      setLoading("");
    }
  }

  async function handleWalletVerify() {
    const provider = getEthereumProvider();
    if (!provider) { showMessage("No browser wallet detected. Install MetaMask or Coinbase Wallet and try again.", "error"); return; }

    setLoading("wallet");
    setMessage("");
    writePendingAuthMethod("wallet_siwe");
    writePostAuthNextPath(nextPath);

    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const selected = accounts?.[0] || "";
      if (!selected) throw new Error("No account returned from wallet.");

      const chainIdHex = (await provider.request({ method: "eth_chainId" })) as string;
      const chainId = Number.parseInt(chainIdHex, 16);

      const nonceResponse = await fetch("/api/wallet-auth/nonce", { method: "POST" });
      const challenge = await nonceResponse.json();

      if (!challenge?.nonce || !challenge?.issuedAt || !challenge?.domain || !challenge?.uri) {
        throw new Error("Could not create wallet challenge.");
      }

      const messageToSign = buildWalletAuthMessage({ address: selected, nonce: challenge.nonce, domain: challenge.domain, uri: challenge.uri, chainId, issuedAt: challenge.issuedAt });
      const signature = (await provider.request({ method: "personal_sign", params: [messageToSign, selected] })) as string;

      const verifyResponse = await fetch("/api/wallet-auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: selected, signature, chainId }) });
      const verifyJson = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyJson?.ok || !verifyJson?.address) {
        throw new Error(verifyJson?.error || "Wallet verification failed.");
      }

      writeAccessMode("wallet");
      writePreviewAccessEnabled(false);
      writeWalletHint(selected);
      writeVerifiedWallet(verifyJson.address);
      setWalletHint(selected);
      setVerifiedWallet(verifyJson.address);
      showMessage(`Wallet verified. Redirecting to your workspace...`, "success");
      setTimeout(() => router.push(nextPath), 700);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Wallet verification failed.", "error");
    } finally {
      setLoading("");
    }
  }

  function continueExistingSession() {
    writeAccessMode(activeEmail ? "email" : verifiedWallet ? "wallet" : readPreviewAccessEnabled() ? "preview" : "wallet");
    router.push(nextPath);
  }

  const currentAccess = activeEmail || verifiedWallet || walletHint;
  const isLoading = Boolean(loading);

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 0,
        minHeight: "calc(100vh - 6rem)",
      }}
      className="xl:grid-cols-[1fr_520px]"
    >
      {/* LEFT: branding panel */}
      <div
        className="hidden xl:flex"
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem",
          borderRadius: "28px 0 0 28px",
          border: "0.5px solid rgba(255,255,255,0.07)",
          borderRight: "none",
          background: "linear-gradient(160deg, rgba(15,26,18,0.98) 0%, rgba(8,14,10,0.96) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,255,96,0.07), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-40px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(103,213,138,0.06), transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "3rem" }}>
            <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem", fontWeight: 600, letterSpacing: "-0.02em", color: "#ecf4ec" }}>
              Stablelane<span style={{ color: "#c9ff60" }}>.</span>
            </span>
          </div>

          <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 300, lineHeight: 1.08, letterSpacing: "-0.04em", color: "#ecf4ec", maxWidth: "380px", marginBottom: "2rem" }}>
            The revenue OS for<br /><em style={{ color: "#c9ff60", fontStyle: "italic" }}>internet-native</em><br />businesses.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              "Invoice clients in USDC or EURC",
              "Lock funds in milestone escrow",
              "Split payouts to collaborators automatically",
              "Build a revenue trail that unlocks credit",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(201,255,96,0.12)", border: "0.5px solid rgba(201,255,96,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#c9ff60" }}>
                  <CheckIcon />
                </div>
                <span style={{ fontSize: "0.875rem", color: "#a5b4aa", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat */}
        <div style={{ position: "relative", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "0.5px solid rgba(201,255,96,0.14)", background: "rgba(201,255,96,0.04)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9ff60", marginBottom: "0.4rem" }}>Built on Arc</div>
          <p style={{ fontSize: "0.85rem", color: "#a5b4aa", lineHeight: 1.6 }}>
            Sub-second finality. ~$0.01 gas fees. USDC as native gas. Multichain settlement via Circle CCTP.
          </p>
        </div>
      </div>

      {/* RIGHT: auth form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2.5rem",
          borderRadius: "28px",
          border: "0.5px solid rgba(255,255,255,0.07)",
          background: "linear-gradient(180deg, rgba(16,27,20,0.94) 0%, rgba(10,18,13,0.9) 100%)",
          backdropFilter: "blur(20px)",
        }}
        className="xl:rounded-l-none xl:rounded-r-[28px]"
      >
        {/* Existing session card */}
        {currentAccess ? (
          <div style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem", borderRadius: "16px", border: "0.5px solid rgba(201,255,96,0.2)", background: "rgba(201,255,96,0.05)" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9ff60", marginBottom: "0.3rem" }}>Active session</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ecf4ec", marginBottom: "0.75rem" }}>
              {activeEmail || shortWallet(verifiedWallet || walletHint)}
            </div>
            <button
              type="button"
              onClick={continueExistingSession}
              style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: "10px", background: "#c9ff60", border: "none", color: "#08100b", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em" }}
            >
              Continue to workspace
            </button>
          </div>
        ) : null}

        {/* Heading */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400, letterSpacing: "-0.04em", color: "#ecf4ec", lineHeight: 1.1, marginBottom: "0.4rem" }}>
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#a5b4aa", lineHeight: 1.6 }}>
            {mode === "signin"
              ? "Sign in to access your workspace, invoices, and escrows."
              : "Join Stablelane. Your first 12 months have zero platform fees."}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "3px", marginBottom: "1.5rem", border: "0.5px solid rgba(255,255,255,0.07)" }}>
          {(["signin", "signup"] as AuthMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setMessage(""); }}
              style={{
                flex: 1,
                padding: "0.55rem 0",
                borderRadius: "9px",
                border: mode === m ? "0.5px solid rgba(201,255,96,0.2)" : "none",
                background: mode === m ? "rgba(201,255,96,0.08)" : "transparent",
                color: mode === m ? "#c9ff60" : "#85938b",
                fontSize: "0.85rem",
                fontWeight: mode === m ? 700 : 500,
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "all 0.15s",
              }}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {/* Email input */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", color: "#85938b", textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            placeholder="you@company.com"
            style={{
              width: "100%",
              padding: "0.8rem 1rem",
              borderRadius: "12px",
              border: "0.5px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#ecf4ec",
              fontSize: "0.95rem",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(201,255,96,0.35)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        {/* Password input */}
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", color: "#85938b", textTransform: "uppercase" }}>
              Password
            </label>
            {mode === "signin" && (
              <span style={{ fontSize: "0.78rem", color: "#c9ff60", cursor: "pointer", fontWeight: 500 }}>
                Forgot password?
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1rem", borderRadius: "12px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", transition: "border-color 0.15s" }}
            onFocus={() => {}}
          >
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
              style={{ flex: 1, background: "transparent", border: "none", color: "#ecf4ec", fontSize: "0.95rem", outline: "none" }}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#85938b", display: "flex", alignItems: "center", padding: "2px", flexShrink: 0 }}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              <EyeIcon open={passwordVisible} />
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", cursor: "pointer" }}>
          <div
            onClick={() => setRememberMe((v) => !v)}
            style={{
              width: 18, height: 18, borderRadius: 5,
              border: rememberMe ? "none" : "1.5px solid rgba(255,255,255,0.2)",
              background: rememberMe ? "#c9ff60" : "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
            }}
          >
            {rememberMe && <CheckIcon />}
          </div>
          <span style={{ fontSize: "0.82rem", color: "#85938b", userSelect: "none" }}>Keep me signed in on this device</span>
        </label>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handlePasswordSubmit}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.9rem",
            borderRadius: "12px",
            border: "none",
            background: loading === "password" ? "rgba(201,255,96,0.7)" : "#c9ff60",
            color: "#08100b",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginBottom: "0.75rem",
            letterSpacing: "0.01em",
            transition: "opacity 0.15s, transform 0.1s",
            opacity: isLoading && loading !== "password" ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "translateY(0)"; }}
        >
          {loading === "password"
            ? (mode === "signup" ? "Creating account..." : "Signing in...")
            : (mode === "signup" ? "Create account" : "Sign in")}
        </button>

        {/* Magic link */}
        <button
          type="button"
          onClick={handleMagicLink}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.875rem",
            borderRadius: "12px",
            border: "0.5px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "#ecf4ec",
            fontSize: "0.9rem",
            fontWeight: 500,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginBottom: "1.25rem",
            letterSpacing: "0.01em",
            transition: "background 0.15s, border-color 0.15s",
            opacity: isLoading && loading !== "magic" ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!isLoading) { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)"; } }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
        >
          {loading === "magic" ? "Sending link..." : "Send magic link instead"}
        </button>

        {/* Divider */}
        {(walletProviders.length > 0 || socialProviders.length > 0) && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.09)" }} />
            <span style={{ fontSize: "0.78rem", color: "#85938b", fontWeight: 500, whiteSpace: "nowrap" }}>or continue with</span>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.09)" }} />
          </div>
        )}

        {/* Wallet buttons */}
        {walletProviders.length > 0 && (
          <div style={{ display: "grid", gap: "0.5rem", marginBottom: socialProviders.length > 0 ? "0.5rem" : "1rem" }}>
            {walletProviders.map((wallet) => (
              <button
                key={wallet.key}
                type="button"
                onClick={handleWalletVerify}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.8rem 1rem",
                  borderRadius: "12px",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                  opacity: isLoading && loading !== "wallet" ? 0.5 : 1,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!isLoading) { (e.currentTarget).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.16)"; }}}
                onMouseLeave={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.05)", flexShrink: 0 }}>
                  <WalletIcon label={wallet.label} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ecf4ec" }}>
                    {loading === "wallet" ? "Connecting wallet..." : `Continue with ${wallet.label}`}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#85938b", marginTop: 1 }}>Sign a message to verify ownership</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Social buttons */}
        {socialProviders.length > 0 && (
          <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
            {socialProviders.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleOAuth(item.key)}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  width: "100%",
                  padding: "0.8rem 1.25rem",
                  borderRadius: "12px",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                  opacity: isLoading && loading !== item.key ? 0.5 : 1,
                  color: "#ecf4ec",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (!isLoading) { (e.currentTarget).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.18)"; }}}
                onMouseLeave={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget).style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
                  {item.key === "google" ? <GoogleIcon /> : <XIcon />}
                </span>
                <span style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#ecf4ec" }}>
                    {loading === item.key ? "Connecting..." : `Continue with ${item.label}`}
                  </span>
                  <span style={{ display: "block", fontSize: "0.74rem", color: "#85938b", marginTop: 1 }}>
                    {item.key === "google" ? "Sign in with your Google account" : "Sign in with your X account"}
                  </span>
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#85938b", flexShrink: 0 }}>
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            border: `0.5px solid ${messageType === "success" ? "rgba(201,255,96,0.2)" : "rgba(255,120,120,0.2)"}`,
            background: messageType === "success" ? "rgba(201,255,96,0.06)" : "rgba(255,80,80,0.06)",
            color: messageType === "success" ? "#c9ff60" : "#ff8b8b",
            fontSize: "0.84rem",
            lineHeight: 1.6,
            marginBottom: "1rem",
          }}>
            {message}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", paddingTop: "0.75rem", borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
          <Link
            href="/app"
            style={{ fontSize: "0.8rem", color: "#85938b", textDecoration: "none", fontWeight: 500 }}
          >
            Browse in preview
          </Link>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
          <Link
            href="/"
            style={{ fontSize: "0.8rem", color: "#85938b", textDecoration: "none", fontWeight: 500 }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
