import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const address = cookieStore.get("stablelane_wallet_verified")?.value || "";
  const issuedAt = cookieStore.get("stablelane_wallet_verified_at")?.value || "";

  return Response.json({
    verified: Boolean(address),
    address: address || null,
    issuedAt: issuedAt || null,
  });
}
