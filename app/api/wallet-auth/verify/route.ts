import { cookies, headers } from "next/headers";
import { verifyMessage } from "viem";
import { buildWalletAuthMessage } from "@/lib/wallet-auth";

type VerifyPayload = {
  address?: string;
  signature?: string;
  chainId?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyPayload;
    const address = body.address || "";
    const signature = body.signature || "";
    const chainId = Number(body.chainId || 0);

    if (!address || !signature || !chainId) {
      return Response.json({ ok: false, error: "Missing wallet verification payload." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const nonce = cookieStore.get("stablelane_wallet_nonce")?.value || "";
    const issuedAt = cookieStore.get("stablelane_wallet_issued_at")?.value || "";

    if (!nonce || !issuedAt) {
      return Response.json({ ok: false, error: "Verification challenge expired. Request a new challenge." }, { status: 400 });
    }

    const headerStore = await headers();
    const host = headerStore.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const domain = host;
    const uri = `${protocol}://${host}`;

    const message = buildWalletAuthMessage({
      address,
      nonce,
      domain,
      uri,
      chainId,
      issuedAt,
    });

    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      return Response.json({ ok: false, error: "Wallet signature could not be verified." }, { status: 401 });
    }

    const cookieSecure = !host.includes("localhost");

    cookieStore.set("stablelane_wallet_verified", address, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("stablelane_wallet_verified_at", new Date().toISOString(), {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.delete("stablelane_wallet_nonce");
    cookieStore.delete("stablelane_wallet_issued_at");

    return Response.json({
      ok: true,
      address,
    });
  } catch {
    return Response.json({ ok: false, error: "Wallet verification failed." }, { status: 500 });
  }
}
