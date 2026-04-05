export type AccessMode = "email" | "wallet" | "preview";

const ACCESS_MODE_KEY = "stablelane_access_mode_v1";
const WALLET_HINT_KEY = "stablelane_wallet_hint_v1";

export function readAccessMode(): AccessMode {
  if (typeof window === "undefined") return "preview";
  const value = window.localStorage.getItem(ACCESS_MODE_KEY);
  if (value === "email" || value === "wallet" || value === "preview") return value;
  return "preview";
}

export function writeAccessMode(mode: AccessMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_MODE_KEY, mode);
}

export function readWalletHint() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(WALLET_HINT_KEY) || "";
}

export function writeWalletHint(address: string) {
  if (typeof window === "undefined") return;
  if (!address) {
    window.localStorage.removeItem(WALLET_HINT_KEY);
    return;
  }
  window.localStorage.setItem(WALLET_HINT_KEY, address);
}

export function shortWallet(value: string) {
  if (!value || value.length < 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}


const VERIFIED_WALLET_KEY = "stablelane_verified_wallet_v1";

export function readVerifiedWallet() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(VERIFIED_WALLET_KEY) || "";
}

export function writeVerifiedWallet(address: string) {
  if (typeof window === "undefined") return;
  if (!address) {
    window.localStorage.removeItem(VERIFIED_WALLET_KEY);
    return;
  }
  window.localStorage.setItem(VERIFIED_WALLET_KEY, address);
}


const PREVIEW_MODE_KEY = "stablelane_preview_access_v1";

export function readPreviewAccessEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PREVIEW_MODE_KEY) === "1";
}

export function writePreviewAccessEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (!enabled) {
    window.localStorage.removeItem(PREVIEW_MODE_KEY);
    return;
  }
  window.localStorage.setItem(PREVIEW_MODE_KEY, "1");
}
