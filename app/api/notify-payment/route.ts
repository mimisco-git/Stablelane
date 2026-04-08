import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, invoiceTitle, clientName, clientEmail, amount, currency, escrowAddress, ownerEmail } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      // Silently succeed if no email config - don't break the payment flow
      return NextResponse.json({ ok: true, sent: false, reason: "No email configured" });
    }

    const explorerLink = escrowAddress
      ? `https://testnet.arcscan.app/address/${escrowAddress}`
      : null;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a120d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <div style="margin-bottom:28px;">
      <span style="font-size:22px;font-weight:700;color:#ecf4ec;letter-spacing:-0.03em;">
        Stablelane<span style="color:#c9ff60;">.</span>
      </span>
    </div>

    <div style="background:linear-gradient(180deg,rgba(14,25,18,.96),rgba(10,18,13,.92));border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
      <div style="display:inline-block;background:rgba(201,255,96,.12);border-radius:999px;padding:4px 14px;margin-bottom:16px;">
        <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#c9ff60;">
          Payment received
        </span>
      </div>

      <h1 style="margin:0 0 8px;font-size:26px;font-weight:600;color:#ecf4ec;letter-spacing:-0.04em;line-height:1.2;">
        ${clientName} funded your escrow
      </h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#85938b;">
        ${amount} ${currency} is now locked in a milestone escrow contract on Arc testnet for
        <strong style="color:#ecf4ec;">${invoiceTitle}</strong>.
        Funds will release when you approve each milestone.
      </p>

      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#5f6e66;margin-bottom:6px;">Amount locked</div>
        <div style="font-size:28px;font-weight:700;color:#c9ff60;letter-spacing:-0.04em;">${amount} ${currency}</div>
      </div>

      ${escrowAddress ? `
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#5f6e66;margin-bottom:6px;">Escrow contract</div>
        <div style="font-family:monospace;font-size:13px;color:#85938b;word-break:break-all;">${escrowAddress}</div>
      </div>
      ` : ""}

      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://stablelane.vercel.app"}/app/invoices/${invoiceId}"
         style="display:block;background:#c9ff60;color:#08100b;text-align:center;padding:14px 24px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:16px;">
        Review invoice and approve milestones
      </a>

      ${explorerLink ? `
      <a href="${explorerLink}"
         style="display:block;text-align:center;padding:12px 24px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);font-size:14px;font-weight:600;color:#85938b;text-decoration:none;">
        View on Arc Explorer
      </a>
      ` : ""}
    </div>

    <p style="text-align:center;font-size:12px;color:#3a4a3f;margin-top:24px;">
      Stablelane &middot; Built on Arc testnet &middot; Stablecoin revenue OS
    </p>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Stablelane <noreply@stablelane.vercel.app>",
        to: [ownerEmail],
        subject: `${clientName} funded your escrow: ${amount} ${currency} locked`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return NextResponse.json({ ok: true, sent: false, reason: "Email send failed" });
    }

    // Also send confirmation to the client
    if (clientEmail && resendKey) {
      const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a120d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="margin-bottom:28px;">
      <span style="font-size:22px;font-weight:700;color:#ecf4ec;letter-spacing:-0.03em;">
        Stablelane<span style="color:#c9ff60;">.</span>
      </span>
    </div>
    <div style="background:linear-gradient(180deg,rgba(14,25,18,.96),rgba(10,18,13,.92));border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
      <div style="display:inline-block;background:rgba(201,255,96,.12);border-radius:999px;padding:4px 14px;margin-bottom:16px;">
        <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#c9ff60;">Payment confirmed</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:600;color:#ecf4ec;letter-spacing:-0.04em;line-height:1.2;">
        Your escrow payment is locked
      </h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#85938b;">
        Your payment of <strong style="color:#ecf4ec;">${amount} ${currency}</strong> for <strong style="color:#ecf4ec;">${invoiceTitle}</strong> is now locked in a milestone escrow contract on Arc testnet. Funds will only release when you approve each milestone.
      </p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#5f6e66;margin-bottom:6px;">Amount locked in escrow</div>
        <div style="font-size:28px;font-weight:700;color:#c9ff60;letter-spacing:-0.04em;">${amount} ${currency}</div>
      </div>
      ${escrowAddress ? `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#5f6e66;margin-bottom:6px;">Escrow contract</div>
        <div style="font-family:monospace;font-size:13px;color:#85938b;word-break:break-all;">${escrowAddress}</div>
      </div>` : ""}
      ${escrowAddress ? `<a href="https://testnet.arcscan.app/address/${escrowAddress}" style="display:block;text-align:center;padding:12px 24px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);font-size:14px;font-weight:600;color:#85938b;text-decoration:none;">View on Arc Explorer</a>` : ""}
    </div>
    <p style="text-align:center;font-size:12px;color:#3a4a3f;margin-top:24px;">Stablelane &middot; Built on Arc testnet</p>
  </div>
</body>
</html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Stablelane <noreply@stablelane.vercel.app>",
          to: [clientEmail],
          subject: `Your escrow payment of ${amount} ${currency} is confirmed`,
          html: clientHtml,
        }),
      });
    }

    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    console.error("notify-payment error:", error);
    return NextResponse.json({ ok: true, sent: false, reason: "Internal error" });
  }
}
