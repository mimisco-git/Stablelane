import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email) return NextResponse.json({ ok: false });

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ ok: true, sent: false });

    const displayName = name || email.split("@")[0];

    const steps = [
      ["1", "Create your first invoice", "Go to Invoices, add milestones, set an amount in USDC, and save."],
      ["2", "Send the payment link", "Copy the /pay/ link from the invoice page and send it to your client."],
      ["3", "Client funds escrow", "Your client connects their wallet and locks USDC before work starts."],
      ["4", "Approve and settle", "When work is done, approve the milestone. Funds release in under 1 second on Arc."],
    ];

    const stepHtml = steps.map(([step, title, detail]) => `
      <div style="display:flex;gap:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;margin-bottom:12px;">
        <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:rgba(201,255,96,.12);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#c9ff60;">${step}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:#ecf4ec;margin-bottom:4px;">${title}</div>
          <div style="font-size:13px;color:#85938b;line-height:1.6;">${detail}</div>
        </div>
      </div>`).join("");

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a120d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="margin-bottom:28px;">
      <span style="font-size:24px;font-weight:700;color:#ecf4ec;letter-spacing:-0.04em;">Stablelane<span style="color:#c9ff60;">.</span></span>
    </div>
    <div style="background:linear-gradient(180deg,rgba(14,25,18,.96),rgba(10,18,13,.92));border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:36px;">
      <div style="display:inline-block;background:rgba(201,255,96,.12);border-radius:999px;padding:4px 14px;margin-bottom:20px;">
        <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#c9ff60;">Welcome to Stablelane</span>
      </div>
      <h1 style="margin:0 0 12px;font-size:28px;font-weight:600;color:#ecf4ec;letter-spacing:-0.04em;line-height:1.2;">
        Your revenue lane is ready, ${displayName}.
      </h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#85938b;">
        Stablelane is your stablecoin revenue OS on Arc testnet. Get started in the next 5 minutes.
      </p>
      ${stepHtml}
      <a href="https://stablelane.vercel.app/app" style="display:block;background:#c9ff60;color:#08100b;text-align:center;padding:14px 24px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none;margin-top:24px;">
        Open your workspace
      </a>
    </div>
    <p style="text-align:center;font-size:12px;color:#3a4a3f;margin-top:24px;">Built on Arc testnet &middot; USDC settlement &middot; Zero platform fees</p>
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
        to: [email],
        subject: `Welcome to Stablelane, ${displayName}. Your lane is ready.`,
        html,
      }),
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch {
    return NextResponse.json({ ok: true, sent: false });
  }
}