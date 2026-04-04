import type { InvoiceDraft } from "@/lib/types";

export const LOCAL_INVOICES_KEY = "stablelane_invoice_drafts_v1";

export function readLocalInvoices(): InvoiceDraft[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOCAL_INVOICES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as InvoiceDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalInvoices(invoices: InvoiceDraft[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(invoices));
}
