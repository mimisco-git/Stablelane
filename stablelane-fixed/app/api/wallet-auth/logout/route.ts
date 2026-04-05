import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("stablelane_wallet_verified");
  cookieStore.delete("stablelane_wallet_verified_at");
  return Response.json({ ok: true });
}
