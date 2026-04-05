import { cookies, headers } from "next/headers";

export async function POST() {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const issuedAt = new Date().toISOString();
  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const domain = host;
  const uri = `${protocol}://${host}`;

  const cookieStore = await cookies();
  cookieStore.set("stablelane_wallet_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: !host.includes("localhost"),
    path: "/",
    maxAge: 60 * 10,
  });
  cookieStore.set("stablelane_wallet_issued_at", issuedAt, {
    httpOnly: true,
    sameSite: "lax",
    secure: !host.includes("localhost"),
    path: "/",
    maxAge: 60 * 10,
  });

  return Response.json({
    nonce,
    issuedAt,
    domain,
    uri,
  });
}
