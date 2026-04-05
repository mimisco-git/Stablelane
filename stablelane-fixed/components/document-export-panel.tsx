"use client";

import { useMemo, useState } from "react";
import { InlineNotice } from "@/components/ui-state";

type ExportMilestone = {
  id: string;
  title: string;
  amount: string;
  detail: string;
};

type ExportSplit = {
  id: string;
  member: string;
  percent: number;
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "stablelane-export";
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function openPrintPreview(html: string) {
  const win = window.open("", "_blank", "noopener,noreferrer,width=1100,height=900");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  return true;
}

function buildInvoiceHtml({
  invoiceId,
  title,
  clientName,
  clientEmail,
  amount,
  currency,
  paymentMode,
  dueDate,
  description,
  milestones,
  splits,
}: {
  invoiceId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  currency: string;
  paymentMode: string;
  dueDate: string;
  description: string;
  milestones: ExportMilestone[];
  splits: ExportSplit[];
}) {
  const milestoneRows = milestones.length
    ? milestones
        .map(
          (item) => `
            <tr>
              <td>${item.title}</td>
              <td>${item.amount} ${currency}</td>
              <td>${item.detail || "No detail"}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="3">No milestones saved yet.</td></tr>`;

  const splitRows = splits.length
    ? splits
        .map(
          (item) => `
            <tr>
              <td>${item.member}</td>
              <td>${item.percent}%</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="2">No payout split saved yet.</td></tr>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} · Stablelane invoice</title>
  <style>
    :root {
      --bg: #08110b;
      --panel: #111b14;
      --panel-2: #0d1711;
      --text: #e7efe9;
      --muted: #9caf9f;
      --line: rgba(201,255,96,.24);
      --accent: #c9ff60;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: linear-gradient(180deg,#0a120d,#08110b);
      color: var(--text);
      font-family: Inter, Arial, sans-serif;
      padding: 40px;
    }
    .wrap { max-width: 980px; margin: 0 auto; }
    .hero, .panel {
      border: 1px solid rgba(255,255,255,.08);
      background: linear-gradient(180deg, rgba(17,27,20,.94), rgba(12,20,15,.92));
      border-radius: 24px;
      padding: 28px;
      margin-bottom: 20px;
    }
    .pill {
      display: inline-block;
      border: 1px solid var(--line);
      background: rgba(201,255,96,.08);
      color: var(--accent);
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .12em;
    }
    h1, h2 { margin: 0 0 10px; }
    h1 { font-size: 40px; line-height: 1; }
    h2 { font-size: 18px; }
    p { color: var(--muted); line-height: 1.7; }
    .grid { display: grid; gap: 14px; }
    .grid-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .meta {
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.03);
      border-radius: 18px;
      padding: 16px;
    }
    .meta small { display: block; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,.08); vertical-align: top; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    .footer-note { color: var(--muted); font-size: 13px; }
    @media print {
      body { background: white; color: black; padding: 0; }
      .hero, .panel, .meta { background: white; color: black; }
      p, .footer-note, .meta small, th { color: #555; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <span class="pill">Stablelane invoice</span>
      <h1>${title}</h1>
      <p>Invoice ID: ${invoiceId}</p>
      <div class="grid grid-2">
        <div class="meta"><small>Client</small><strong>${clientName}</strong><div>${clientEmail || "No email"}</div></div>
        <div class="meta"><small>Total</small><strong>${amount} ${currency}</strong><div>${paymentMode}</div></div>
        <div class="meta"><small>Due date</small><strong>${dueDate || "Not set"}</strong></div>
        <div class="meta"><small>Status context</small><strong>Print-ready workspace export</strong></div>
      </div>
    </section>

    <section class="panel">
      <h2>Scope and notes</h2>
      <p>${description || "No invoice description was saved yet."}</p>
    </section>

    <section class="panel">
      <h2>Milestones</h2>
      <table>
        <thead>
          <tr><th>Milestone</th><th>Amount</th><th>Detail</th></tr>
        </thead>
        <tbody>${milestoneRows}</tbody>
      </table>
    </section>

    <section class="panel">
      <h2>Payout split</h2>
      <table>
        <thead>
          <tr><th>Member</th><th>Percent</th></tr>
        </thead>
        <tbody>${splitRows}</tbody>
      </table>
    </section>

    <section class="panel">
      <div class="footer-note">
        This export is branded for Stablelane and is ready for print-to-PDF workflow from the browser.
      </div>
    </section>
  </div>
</body>
</html>`;
}

function buildReceiptHtml({
  invoiceId,
  clientName,
  amount,
  currency,
  fundingTxHash,
  releaseTxHash,
}: {
  invoiceId: string;
  clientName: string;
  amount: string;
  currency: string;
  fundingTxHash?: string | null;
  releaseTxHash?: string | null;
}) {
  const receiptRows = [
    fundingTxHash
      ? `<tr><td>Funding receipt</td><td>${fundingTxHash}</td><td>Funding confirmed for ${amount} ${currency}</td></tr>`
      : "",
    releaseTxHash
      ? `<tr><td>Release receipt</td><td>${releaseTxHash}</td><td>Release completed for invoice ${invoiceId}</td></tr>`
      : "",
  ].filter(Boolean).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${invoiceId} · Stablelane settlement receipt</title>
  <style>
    :root {
      --bg: #08110b;
      --panel: #101a14;
      --text: #e7efe9;
      --muted: #9caf9f;
      --line: rgba(201,255,96,.24);
      --accent: #c9ff60;
    }
    body {
      margin: 0;
      background: linear-gradient(180deg,#0a120d,#08110b);
      color: var(--text);
      font-family: Inter, Arial, sans-serif;
      padding: 40px;
    }
    .wrap { max-width: 960px; margin: 0 auto; }
    .panel {
      border: 1px solid rgba(255,255,255,.08);
      background: linear-gradient(180deg, rgba(17,27,20,.94), rgba(12,20,15,.92));
      border-radius: 24px;
      padding: 28px;
      margin-bottom: 20px;
    }
    .pill {
      display: inline-block;
      border: 1px solid var(--line);
      background: rgba(201,255,96,.08);
      color: var(--accent);
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .12em;
      margin-bottom: 12px;
    }
    h1 { margin: 0 0 10px; font-size: 38px; line-height: 1; }
    p { color: var(--muted); line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,.08); vertical-align: top; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    @media print {
      body { background: white; color: black; padding: 0; }
      .panel { background: white; color: black; }
      p, th { color: #555; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="panel">
      <span class="pill">Stablelane settlement receipt</span>
      <h1>Receipt bundle</h1>
      <p>Invoice ID: ${invoiceId}</p>
      <p>Client: ${clientName}</p>
      <p>Invoice value: ${amount} ${currency}</p>

      <table>
        <thead>
          <tr><th>Receipt</th><th>Transaction hash</th><th>Note</th></tr>
        </thead>
        <tbody>
          ${receiptRows || `<tr><td colspan="3">No settlement receipts are saved yet.</td></tr>`}
        </tbody>
      </table>
    </section>
  </div>
</body>
</html>`;
}

export function DocumentExportPanel({
  invoiceId,
  title,
  clientName,
  clientEmail,
  amount,
  currency,
  paymentMode,
  dueDate,
  description,
  milestones,
  splits,
  fundingTxHash,
  releaseTxHash,
}: {
  invoiceId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  currency: string;
  paymentMode: string;
  dueDate: string;
  description: string;
  milestones: ExportMilestone[];
  splits: ExportSplit[];
  fundingTxHash?: string | null;
  releaseTxHash?: string | null;
}) {
  const [message, setMessage] = useState("");

  const invoiceHtml = useMemo(
    () =>
      buildInvoiceHtml({
        invoiceId,
        title,
        clientName,
        clientEmail,
        amount,
        currency,
        paymentMode,
        dueDate,
        description,
        milestones,
        splits,
      }),
    [invoiceId, title, clientName, clientEmail, amount, currency, paymentMode, dueDate, description, milestones, splits]
  );

  const receiptHtml = useMemo(
    () =>
      buildReceiptHtml({
        invoiceId,
        clientName,
        amount,
        currency,
        fundingTxHash,
        releaseTxHash,
      }),
    [invoiceId, clientName, amount, currency, fundingTxHash, releaseTxHash]
  );

  function downloadInvoice() {
    downloadTextFile(`${makeSlug(title)}-invoice.html`, invoiceHtml, "text/html;charset=utf-8");
    setMessage("Invoice export downloaded. Open it in the browser and print to PDF if you want a fixed document.");
  }

  function printInvoice() {
    const ok = openPrintPreview(invoiceHtml);
    setMessage(ok ? "Invoice print preview opened in a new tab." : "Print preview could not be opened.");
  }

  function downloadReceipt() {
    downloadTextFile(`${makeSlug(title)}-settlement-receipt.html`, receiptHtml, "text/html;charset=utf-8");
    setMessage("Settlement receipt export downloaded.");
  }

  function printReceipt() {
    const ok = openPrintPreview(receiptHtml);
    setMessage(ok ? "Settlement receipt print preview opened in a new tab." : "Print preview could not be opened.");
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Document exports</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          Create branded invoice and settlement receipt exports from the live record. These files are print-ready and can be saved as PDF from the browser.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-2 font-semibold">Invoice export</div>
          <p className="mb-3 text-[0.82rem] leading-6 text-[var(--muted)]">
            Branded invoice document with scope, milestones, and payout split.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadInvoice}
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.9rem] font-bold text-[#08100b]"
            >
              Download invoice
            </button>
            <button
              type="button"
              onClick={printInvoice}
              className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.9rem] font-bold text-[var(--text)]"
            >
              Print invoice
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-2 font-semibold">Settlement receipt export</div>
          <p className="mb-3 text-[0.82rem] leading-6 text-[var(--muted)]">
            Explorer-linked receipt bundle for funding and release lifecycle records.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadReceipt}
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.9rem] font-bold text-[#08100b]"
            >
              Download receipt
            </button>
            <button
              type="button"
              onClick={printReceipt}
              className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.9rem] font-bold text-[var(--text)]"
            >
              Print receipt
            </button>
          </div>
        </div>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice title="Document export" detail={message} tone="success" />
        </div>
      ) : null}
    </section>
  );
}
