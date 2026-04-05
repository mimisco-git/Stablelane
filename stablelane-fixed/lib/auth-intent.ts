export type PendingAuthMethod =
  | "email_password"
  | "email_magic_link"
  | "google_oauth"
  | "apple_oauth"
  | "x_oauth"
  | "wallet_siwe"
  | "";

const NEXT_PATH_KEY = "stablelane_post_auth_next_v1";
const PENDING_METHOD_KEY = "stablelane_pending_auth_method_v1";

export function sanitizeNextPath(value: string | null | undefined) {
  if (!value) return "/app";
  if (!value.startsWith("/")) return "/app";
  if (value.startsWith("//")) return "/app";
  if (value.startsWith("/auth")) return "/app";
  return value;
}

export function readPostAuthNextPath() {
  if (typeof window === "undefined") return "/app";
  return sanitizeNextPath(window.localStorage.getItem(NEXT_PATH_KEY));
}

export function writePostAuthNextPath(path: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEXT_PATH_KEY, sanitizeNextPath(path));
}

export function clearPostAuthNextPath() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NEXT_PATH_KEY);
}

export function readPendingAuthMethod(): PendingAuthMethod {
  if (typeof window === "undefined") return "";
  const value = window.localStorage.getItem(PENDING_METHOD_KEY) || "";
  if (
    value === "email_password" ||
    value === "email_magic_link" ||
    value === "google_oauth" ||
    value === "apple_oauth" ||
    value === "x_oauth" ||
    value === "wallet_siwe"
  ) {
    return value;
  }
  return "";
}

export function writePendingAuthMethod(method: PendingAuthMethod) {
  if (typeof window === "undefined") return;
  if (!method) {
    window.localStorage.removeItem(PENDING_METHOD_KEY);
    return;
  }
  window.localStorage.setItem(PENDING_METHOD_KEY, method);
}

export function clearPendingAuthMethod() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_METHOD_KEY);
}
